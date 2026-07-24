/* eslint-disable @typescript-eslint/no-explicit-any */
import { createReadStream, existsSync, statSync, unlinkSync } from "fs";
import { Client } from "minio";
import { parseStringPromise } from "xml2js";
import { IExcelProcessor } from "./types.js";

export interface MinioExportOptions {
  bucketName?: string;
  partSizeMB?: number;
}

export interface MinioExporter {
  exportToMinio(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string
  ): Promise<string>;
}

export abstract class MinioExcelProcessor implements IExcelProcessor {
  protected bucketName: string;
  protected partSizeMB: number;

  constructor(options: MinioExportOptions = {}) {
    this.bucketName = options.bucketName || "smile-platform";
    this.partSizeMB = options.partSizeMB || 10;
  }

  public abstract loadFromBuffer(buffer: ArrayBuffer | Buffer): Promise<void>;
  public abstract loadFromFile(path: string): Promise<void>;
  public abstract initSheet(title: string): Promise<void>;
  public abstract setColumns(
    columns: any[],
    startCell?: string,
    sheetName?: string
  ): void;
  public abstract addRows(
    sheetName: string,
    rows: AsyncIterableIterator<object> | object[],
    rowIndex?: number,
    columnLetter?: string,
    style?: any
  ): Promise<void>;
  public abstract getRows(sheetName?: string, options?: any): object[];
  public abstract generate(): Promise<ArrayBuffer>;
  public abstract writeFile(filePath: string): Promise<void>;
  public abstract addDataValidation(
    sheetName: string,
    columnLetter: string,
    startRow: number,
    endRow: number,
    sourceSheetName: string,
    sourceColumnLetter: string,
    sourceStartRow: number,
    allowInvalid: boolean
  ): Promise<void>;
  public abstract protectSheet(
    sheetName: string,
    password?: string
  ): Promise<void>;
  public abstract setRowFontBold(
    sheetName: string,
    rowIndex: number,
    startColumnLetter?: string
  ): Promise<void>;
  public abstract setRowAlignCenter(
    sheetName: string,
    rowIndex: number,
    startColumnLetter?: string
  ): Promise<void>;
  public abstract mergeCells(
    sheetName: string,
    startCell: string,
    endCell: string,
    center?: boolean
  ): void;
  public abstract autoFitColumns(
    sheetName: string,
    rowIndex?: number,
    startColumnLetter?: string
  ): Promise<void>;
  public abstract updateCellValue(
    sheetName: string,
    cellAddress: string,
    value: unknown
  ): Promise<void>;
  public abstract setCellWrapText(
    sheetName: string,
    cellAddress: string
  ): Promise<void>;

  public async exportToMinio(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string
  ): Promise<string> {
    try {
      console.log("Start exporting to Minio...");

      // 0. Generate Excel buffer
      await this.generate(); // Generate the workbook internally
      const filePath = originalFilename + ".xlsx"; // Assuming .xlsx extension

      // Create a temporary file to write the buffer to
      await this.writeFile(filePath);

      // 3. Ensure bucket exists
      console.log("🪣 Checking/creating bucket:", this.bucketName);
      if (!(await minioClient.bucketExists(this.bucketName))) {
        await minioClient.makeBucket(
          this.bucketName,
          process.env.MINIO_REGION ?? "ap-southeast-3"
        );
      }

      // 4. Upload to MinIO
      if (!existsSync(filePath)) {
        throw new Error(`📁 File not found: ${filePath}`);
      }

      console.log("🔃 Uploading file to Minio:", filePath);
      await this.uploadFileToMinio(
        minioClient,
        filePath,
        filePath,
        this.bucketName,
        this.partSizeMB
      );

      // 5. Cleanup
      unlinkSync(filePath);
      console.log("✅ Upload file to Minio complete. File removed.");

      return `${endpointUrl}/${this.bucketName}/${filePath}`;
    } catch (error) {
      console.error("❌ Error uploading file to Minio:", error);
      throw error;
    }
  }

  // Utility: stream ke string
  protected async streamToString(stream: NodeJS.ReadableStream) {
    return new Promise<string>((resolve, reject) => {
      let data = "";
      stream.on("data", (chunk) => (data += chunk));
      stream.on("end", () => resolve(data));
      stream.on("error", reject);
    });
  }

  // Inisiasi multipart + generate presigned URLs
  protected async createMultipartPresignedUrls(
    client: Client,
    bucket: string,
    objectName: string,
    partCount: number
  ) {
    const res = await client.makeRequestAsync({
      method: "POST",
      bucketName: bucket,
      objectName,
      query: "uploads",
    });

    const xml = await this.streamToString(res);
    const parsed = await parseStringPromise(xml);
    const uploadId = parsed.InitiateMultipartUploadResult.UploadId[0];

    const urls: { partNumber: number; url: string }[] = [];
    for (let partNumber = 1; partNumber <= partCount; partNumber++) {
      const url = await client.presignedUrl(
        "PUT",
        bucket,
        objectName,
        24 * 60 * 60,
        {
          uploadId,
          partNumber,
        }
      );
      urls.push({ partNumber, url });
    }

    return { uploadId, urls };
  }

  // Selesaikan multipart upload
  protected async completeMultipartUpload(
    client: Client,
    bucketName: string,
    objectName: string,
    uploadId: string,
    parts: { partNumber: number; eTag: string }[]
  ) {
    // Pastikan part diurutkan
    parts.sort((a, b) => a.partNumber - b.partNumber);

    // Pastikan ETag tidak double-quote ganda
    const xmlPayload =
      "<CompleteMultipartUpload>" +
      parts
        .map(
          (p) =>
            `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>"${p.eTag.replace(/"/g, "")}"</ETag></Part>`
        )
        .join("") +
      "</CompleteMultipartUpload>";

    const res = await client.makeRequestAsync(
      {
        method: "POST",
        bucketName,
        objectName,
        query: `uploadId=${uploadId}`,
      },
      xmlPayload,
      [200],
      ""
    );

    return await this.streamToString(res);
  }

  // Fungsi utama
  protected async uploadFileToMinio(
    client: Client,
    objectName: string,
    filePath: string, // 📂 path file lokal
    bucketName: string,
    partSizeMB: number
  ) {
    const partSize = partSizeMB * 1024 * 1024;

    // Cek ukuran file
    const stats = statSync(filePath);
    const totalSize = stats.size;
    const partCount = Math.ceil(totalSize / partSize);

    // Pastikan bucket ada
    const exists = await client.bucketExists(bucketName).catch(() => false);
    if (!exists) await client.makeBucket(bucketName);

    // Buat presigned URL
    const { uploadId, urls } = await this.createMultipartPresignedUrls(
      client,
      bucketName,
      objectName,
      partCount
    );

    // Baca file stream per part
    const stream = createReadStream(filePath, { highWaterMark: partSize });
    let partNumber = 0;
    const partsMeta: { partNumber: number; eTag: string }[] = [];

    for await (const chunk of stream) {
      const urlObj = urls[partNumber];
      if (!urlObj) {
        throw new Error(`URL for part ${partNumber + 1} is undefined`);
      }
      const { url } = urlObj;
      const res = await fetch(url, { method: "PUT", body: chunk });
      if (!res.ok)
        throw new Error(
          `Upload part ${partNumber + 1} gagal: ${res.statusText}`
        );

      const eTag = res.headers.get("ETag")?.replace(/"/g, "") || "";
      partsMeta.push({ partNumber: partNumber + 1, eTag });
      console.log(`✅ [MINIO] Uploaded part ${partNumber + 1}`);
      partNumber++;
    }

    // Selesaikan upload
    await this.completeMultipartUpload(
      client,
      bucketName,
      objectName,
      uploadId,
      partsMeta
    );
    console.log(
      `🎉 [MINIO] File uploaded to MinIO: ${bucketName}/${objectName}`
    );

    // Info size
    const stat = await client.statObject(bucketName, objectName);
    const fileSizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log("📏 [MINIO] File size:", fileSizeMB, "MB");
  }
}
