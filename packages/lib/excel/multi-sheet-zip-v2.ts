import { createReadStream, createWriteStream } from "fs";
import {
  access,
  mkdir,
  rm,
  stat as fsStat,
  unlink,
  writeFile,
} from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import JSZip from "jszip";
import { Client } from "minio";
import BaseTemplate from "./index.js";
import WarehouseTemplate from "./warehouse-template.js";
import { Column, Filter, PROCESSOR } from "./types.js";
import { cleanSheetName } from "../utils.js";
import { parseStringPromise } from "xml2js";
import { sanitizeCell } from "./util.js";

export interface MultiSheetZipExportOptions {
  language: string;
  timezone?: string;
  batchSize?: number;
  bucketName?: string;
  partSizeMB?: number;
}

export interface FileGroup {
  title: string;
  titleBar?: Record<string, string>;
  template: WarehouseTemplate | BaseTemplate;
  rows: Record<string, Record<string, unknown>[]>;
  columns: Record<string, Column[]>;
  filters?: Record<string, Filter[]>;
}

interface TempFileInfo {
  fileName: string;
  tempFilePath: string;
}

export class MultiSheetZipExporter {
  private zip: JSZip;
  private batchSize: number;
  private fileGroups: Record<string, FileGroup>;
  private bucketName: string;
  private partSizeMB: number;
  private fileIndices: Record<string, number>;
  private sheetRowCounts: Record<string, Record<string, number>> = {};
  private totalRowsProcessed: Record<string, number> = {};
  private tempFiles: TempFileInfo[] = [];
  private tempDir: string;
  private tempDirCreated = false;

  constructor(private options: MultiSheetZipExportOptions) {
    this.zip = new JSZip();
    this.batchSize = options.batchSize || 100000;
    this.fileGroups = {};
    this.fileIndices = {};
    this.bucketName = options.bucketName || "smile-platform";
    this.partSizeMB = options.partSizeMB || 10;
    this.tempDir = join(
      tmpdir(),
      `excel-export-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
  }

  private async ensureTempDir(): Promise<void> {
    if (!this.tempDirCreated) {
      await mkdir(this.tempDir, { recursive: true });
      this.tempDirCreated = true;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public initFileGroup(groupId: string, title: string): this {
    if (this.fileGroups[groupId]) {
      return this;
    }

    const template: BaseTemplate = new BaseTemplate(14, 1, PROCESSOR.SHEETJS);

    template.setTitle(title);
    template.setLanguage(this.options.language);
    if (this.options.timezone) {
      template.setTimezone(this.options.timezone);
    }

    this.fileGroups[groupId] = {
      title,
      template,
      rows: {},
      columns: {},
    };

    this.fileIndices[groupId] = 1;

    return this;
  }

  public async initFileGroupWarehouse(
    groupId: string,
    title: string,
  ): Promise<this> {
    if (this.fileGroups[groupId]) {
      return this;
    }

    const template = new WarehouseTemplate();

    await template.initWorkbook();
    template.setTitle(title);
    template.setLanguage(this.options.language);
    if (this.options.timezone) {
      template.setTimezone(this.options.timezone);
    }

    this.fileGroups[groupId] = {
      title,
      titleBar: {},
      template,
      rows: {},
      columns: {},
      filters: {},
    };

    this.fileIndices[groupId] = 1;

    return this;
  }

  public async initSheet(groupId: string, sheetName: string): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    if (!this.fileGroups[groupId]) {
      throw new Error(`File group ${groupId} not found`);
    }

    // Check if sheet is already initialized
    if (this.fileGroups[groupId].rows[cleanedSheetName] !== undefined) {
      return this;
    }

    await this.fileGroups[groupId].template.initSheet(cleanedSheetName);
    this.fileGroups[groupId].rows[cleanedSheetName] = [];

    return this;
  }

  public async setTitleBar(
    groupId: string,
    sheetName: string,
    columns: Column[],
    title: string,
  ) {
    const cleanedSheetName = cleanSheetName(sheetName);

    if (!this.fileGroups[groupId]) {
      throw new Error(`File group ${groupId} not found`);
    }

    // Ensure sheet is initialized before setting columns
    await this.initSheet(groupId, cleanedSheetName);

    if (
      this.fileGroups[groupId].template instanceof WarehouseTemplate &&
      this.fileGroups[groupId].titleBar
    ) {
      this.fileGroups[groupId].titleBar[cleanedSheetName] = title;
      this.fileGroups[groupId].template.setTitleBar(
        cleanedSheetName,
        columns,
        title,
      );
    }
  }

  public async setFilters(
    groupId: string,
    sheetName: string,
    filters: Filter[],
  ) {
    const cleanedSheetName = cleanSheetName(sheetName);

    if (!this.fileGroups[groupId]) {
      throw new Error(`File group ${groupId} not found`);
    }

    // Ensure sheet is initialized before setting columns
    await this.initSheet(groupId, cleanedSheetName);

    if (
      this.fileGroups[groupId].template instanceof WarehouseTemplate &&
      this.fileGroups[groupId].filters
    ) {
      this.fileGroups[groupId].filters[cleanedSheetName] = filters;
      this.fileGroups[groupId].template.setFilters(cleanedSheetName, filters);
    }
  }

  public async setColumns(
    groupId: string,
    sheetName: string,
    columns: Column[],
    startCell = "A1",
  ): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    if (!this.fileGroups[groupId]) {
      throw new Error(`File group ${groupId} not found`);
    }

    // Ensure sheet is initialized before setting columns
    await this.initSheet(groupId, cleanedSheetName);

    this.fileGroups[groupId].columns[cleanedSheetName] = columns;
    this.fileGroups[groupId].template.setColumns(
      columns,
      startCell,
      cleanedSheetName,
    );

    return this;
  }

  public async addRow(
    groupId: string,
    sheetName: string,
    row: Record<string, unknown>,
  ): Promise<this> {
    await this.addRows(groupId, sheetName, [row]);
    return this;
  }

  public async addRows(
    groupId: string,
    sheetName: string,
    rows:
      | Record<string, unknown>[]
      | AsyncIterableIterator<Record<string, unknown>>,
  ): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    if (!this.sheetRowCounts[groupId]) {
      this.sheetRowCounts[groupId] = {};
    }
    if (this.sheetRowCounts[groupId][cleanedSheetName] === undefined) {
      this.sheetRowCounts[groupId][cleanedSheetName] = 0;
    }
    if (this.totalRowsProcessed[groupId] === undefined) {
      this.totalRowsProcessed[groupId] = 0;
    }

    if (Array.isArray(rows)) {
      const rowsArray = rows as Record<string, unknown>[];
      const chunkSize = Math.min(this.batchSize, rowsArray.length);

      for (let i = 0; i < rowsArray.length; i += chunkSize) {
        const chunk = rowsArray.slice(i, i + chunkSize);

        for (const row of chunk) {
          if (!this.fileGroups[groupId]) {
            throw new Error(`File group ${groupId} not found`);
          }

          if (!this.fileGroups[groupId].rows[cleanedSheetName]) {
            this.fileGroups[groupId].rows[cleanedSheetName] = [];
          }

          this.fileGroups[groupId].rows[cleanedSheetName].push(sanitizeCell(row));

          const shouldFlushNow = this.shouldFlushGroup(groupId);
          if (shouldFlushNow) {
            await this.flushAllSheetsInGroup(groupId);
          }
        }
      }
    } else {
      let count = 0;

      for await (const row of rows as AsyncIterableIterator<
        Record<string, unknown>
      >) {
        if (!this.fileGroups[groupId]) {
          throw new Error(`File group ${groupId} not found`);
        }

        if (!this.fileGroups[groupId].rows[cleanedSheetName]) {
          this.fileGroups[groupId].rows[cleanedSheetName] = [];
        }

        this.fileGroups[groupId].rows[cleanedSheetName].push(sanitizeCell(row));
        count++;

        if (
          this.fileGroups[groupId].rows[cleanedSheetName].length >=
          this.batchSize
        ) {
          await this.flushAllSheetsInGroup(groupId);
        }

        if (count % 1000 === 0) {
          console.log(`Processed ${count} rows from async iterable`);
        }
      }
    }

    return this;
  }

  private shouldFlushGroup(groupId: string): boolean {
    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      return false;
    }

    const sheetNames = Object.keys(fileGroup.rows);
    if (sheetNames.length === 0) {
      return false;
    }

    // Get all sheets that have any data
    const sheetsWithData = sheetNames.filter((sheetName) => {
      const rowCount = fileGroup.rows[sheetName]?.length || 0;
      return rowCount > 0;
    });

    if (sheetsWithData.length === 0) {
      return false;
    }

    // Sequential filling: flush when ANY sheet reaches batch size
    // This allows for proper distribution where sheets can have different amounts of data
    const hasSheetAtBatchSize = sheetsWithData.some((sheetName) => {
      const rowCount = fileGroup.rows[sheetName]?.length || 0;
      return rowCount >= this.batchSize;
    });

    return hasSheetAtBatchSize;
  }

  /**
   * Flush sheets sequentially up to batch size per sheet
   * @param groupId The file group identifier
   */
  private async flushAllSheetsInGroup(groupId: string): Promise<void> {
    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    // Only process sheets that actually have data to flush
    const sheetsWithData = Object.keys(fileGroup.rows).filter((sheetName) => {
      const availableRows = fileGroup.rows[sheetName]?.length || 0;
      return availableRows > 0;
    });

    let anyRowsFlushed = false;

    for (const sheetName of sheetsWithData) {
      // Ensure sheet is initialized in template
      try {
        await fileGroup.template.initSheet(sheetName);
        if (fileGroup.columns[sheetName]) {
          fileGroup.template.setColumns(
            fileGroup.columns[sheetName],
            "A1",
            sheetName,
          );
        }
      } catch {
        // Sheet might already exist, continue
      }

      const availableRows = fileGroup.rows[sheetName]?.length || 0;
      const rowsToFlush = Math.min(availableRows, this.batchSize);

      const flushedRows =
        fileGroup.rows[sheetName]?.splice(0, rowsToFlush) ?? [];
      if (flushedRows.length > 0) {
        await fileGroup.template.addRows(sheetName, flushedRows);
        anyRowsFlushed = true;
      }
    }

    if (anyRowsFlushed) {
      // Create new file part with proper indexing
      const currentIndex = this.fileIndices[groupId] || 1;
      await this.flushFileGroup(groupId, currentIndex);
      this.fileIndices[groupId] = (this.fileIndices[groupId] || 1) + 1;

      // Rows are automatically removed from arrays via splice, no need to reset counters
      // The finalize method will handle remaining rows
    }
  }

  /**
   * Flush all rows for a file group, generate the Excel file, and add it to the zip
   * @param groupId The file group identifier
   * @param fileIndex Optional index to append to the filename
   */
  private async flushFileGroup(
    groupId: string,
    fileIndex: number,
  ): Promise<void> {
    let newTemplate: BaseTemplate | WarehouseTemplate;
    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      return;
    }

    const fileName = fileIndex
      ? `${fileGroup.title}_Part${fileIndex}.xlsx`
      : `${fileGroup.title}.xlsx`;

    const { buffer } = await fileGroup.template.generate();

    // Write to temp file instead of accumulating in JSZip memory
    await this.ensureTempDir();
    const tempFilePath = join(this.tempDir, fileName);
    await writeFile(tempFilePath, Buffer.from(buffer as ArrayBuffer));
    this.tempFiles.push({ fileName, tempFilePath });

    if (fileGroup.template instanceof WarehouseTemplate) {
      newTemplate = new WarehouseTemplate();
      await newTemplate.initWorkbook();
    } else {
      newTemplate = new BaseTemplate(2, 1, PROCESSOR.SHEETJS);
    }

    newTemplate.setTitle(fileGroup.title);
    newTemplate.setLanguage(this.options.language);
    if (this.options.timezone) {
      newTemplate.setTimezone(this.options.timezone);
    }

    const sheetNames = Object.keys(fileGroup.columns);
    for (const sheetName of sheetNames) {
      await newTemplate.initSheet(sheetName);
      if (
        fileGroup.titleBar &&
        fileGroup.titleBar[sheetName] &&
        fileGroup.columns[sheetName] &&
        newTemplate instanceof WarehouseTemplate
      ) {
        newTemplate.setTitleBar(
          sheetName,
          fileGroup.columns[sheetName],
          fileGroup.titleBar[sheetName],
        );
      }
      if (
        fileGroup.filters &&
        fileGroup.filters[sheetName] &&
        newTemplate instanceof WarehouseTemplate
      ) {
        newTemplate.setFilters(sheetName, fileGroup.filters[sheetName]);
      }
      if (fileGroup.columns[sheetName]) {
        newTemplate.setColumns(fileGroup.columns[sheetName], "A1", sheetName);
      }
    }

    fileGroup.template = newTemplate;
  }

  /**
   * Finalize all file groups and return the zip
   * @returns JSZip instance
   */
  public async finalize(): Promise<JSZip> {
    const groupIds = Object.keys(this.fileGroups);
    for (const groupId of groupIds) {
      const sheetNames = Object.keys(this.fileGroups[groupId]?.rows || {});
      let hasRemainingRows = sheetNames.some((sheetName) => {
        const group = this.fileGroups[groupId];
        if (!group) return false;
        const sheetRows = group.rows[sheetName];
        return sheetRows ? sheetRows.length > 0 : false;
      });

      // Continue flushing remaining rows in batches
      let iterationCount = 0;
      const maxIterations = 10; // Safety limit to prevent infinite loops
      while (hasRemainingRows && iterationCount < maxIterations) {
        iterationCount++;
        const fileGroup = this.fileGroups[groupId];

        // Ensure template has all sheets initialized
        for (const sheetName of sheetNames) {
          try {
            if (fileGroup) {
              await fileGroup.template.initSheet(sheetName);
            }
            if (fileGroup?.columns[sheetName]) {
              fileGroup.template.setColumns(
                fileGroup.columns[sheetName],
                "A1",
                sheetName,
              );
            }
          } catch {
            // Sheet might already exist, continue
          }
        }

        // Use the same balanced flushing logic as the main method
        await this.flushAllSheetsInGroup(groupId);

        // Check if there are still remaining rows
        hasRemainingRows = sheetNames.some((sheetName) => {
          const sheetRows = this.fileGroups[groupId]?.rows[sheetName];
          return sheetRows ? sheetRows.length > 0 : false;
        });
      }
    }

    // Stream temp files into ZIP (memory efficient - files are read on-demand during ZIP generation)
    for (const { fileName, tempFilePath } of this.tempFiles) {
      if (await this.fileExists(tempFilePath)) {
        this.zip.file(fileName, createReadStream(tempFilePath));
      }
    }

    return this.zip;
  }

  /**
   * Cleanup temporary files and directory
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.tempDirCreated && (await this.fileExists(this.tempDir))) {
        await rm(this.tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn(`Failed to cleanup temp directory: ${this.tempDir}`, e);
    }
    this.tempFiles = [];
    this.tempDirCreated = false;
  }

  /**
   * Generates a ZIP stream from the current state of the exporter, saves it to a file, and returns the path to the saved file.
   * @param originalFilename Original filename (without extension) to use for the saved file
   * @returns Path to the saved ZIP file
   */
  public async generateAndSaveZipFile(
    originalFilename: string,
  ): Promise<string> {
    // 1. Generate ZIP stream
    const zipStream = (await this.finalize()).generateNodeStream({
      type: "nodebuffer",
      streamFiles: true,
    });

    // 2. Save zip to file
    const zipFilePath = originalFilename;
    const output = createWriteStream(zipFilePath);
    console.log("✍🏻 Writing zip stream to file:", zipFilePath);
    zipStream.pipe(output);

    await new Promise<void>((resolve, reject) => {
      output.on("finish", resolve);
      output.on("error", reject);
    });

    // Cleanup temp files after ZIP is written
    await this.cleanup();

    return zipFilePath;
  }

  /**
   * Export the zip file to Minio
   * @param minioClient Minio client instance
   * @param endpointUrl Minio endpoint URL
   * @param originalFilename Original filename
   * @returns URL to the exported file
   */
  public async exportToMinio(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string,
  ): Promise<string> {
    try {
      console.log("Start exporting to Minio...");

      // 0. Generate ZIP stream
      const zipFilePath = await this.generateAndSaveZipFile(originalFilename);

      // 3. Ensure bucket exists
      console.log("🪣 Checking/creating bucket:", this.bucketName);
      if (!(await minioClient.bucketExists(this.bucketName))) {
        await minioClient.makeBucket(
          this.bucketName,
          process.env.MINIO_REGION ?? "ap-southeast-3",
        );
      }

      // 4. Upload to MinIO
      if (!(await this.fileExists(zipFilePath))) {
        throw new Error(`📁 File not found: ${zipFilePath}`);
      }

      console.log("🔃 Uploading file to Minio:", zipFilePath);
      await this.uploadFileToMinio(
        minioClient,
        zipFilePath,
        zipFilePath,
        this.bucketName,
        this.partSizeMB,
      );

      // 5. Cleanup
      await unlink(zipFilePath);
      console.log("✅ Upload file to Minio complete. File removed.");

      return `${endpointUrl}/${this.bucketName}/${zipFilePath}`;
    } catch (error) {
      console.error("❌ Error uploading file to Minio:", error);
      // Ensure temp files are cleaned up on error
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Upload a file buffer to MinIO.
   */

  // Utility: stream ke string
  private async streamToString(stream: NodeJS.ReadableStream) {
    return new Promise<string>((resolve, reject) => {
      let data = "";
      stream.on("data", (chunk) => (data += chunk));
      stream.on("end", () => resolve(data));
      stream.on("error", reject);
    });
  }

  // Inisiasi multipart + generate presigned URLs
  private async createMultipartPresignedUrls(
    client,
    bucket: string,
    objectName: string,
    partCount: number,
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
        },
      );
      urls.push({ partNumber, url });
    }

    return { uploadId, urls };
  }

  // Selesaikan multipart upload
  private async completeMultipartUpload(
    client,
    bucketName,
    objectName,
    uploadId,
    parts,
  ) {
    // Pastikan part diurutkan
    parts.sort((a, b) => a.partNumber - b.partNumber);

    // Pastikan ETag tidak double-quote ganda
    const xmlPayload =
      "<CompleteMultipartUpload>" +
      parts
        .map(
          (p) =>
            `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>"${p.eTag.replace(/"/g, "")}"</ETag></Part>`,
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
      "",
    );

    return await this.streamToString(res);
  }

  // Fungsi utama
  public async uploadFileToMinio(
    client,
    objectName: string,
    filePath: string, // 📂 path file lokal
    bucketName: string,
    partSizeMB: number,
  ) {
    const partSize = partSizeMB * 1024 * 1024;

    // Cek ukuran file
    const stats = await fsStat(filePath);
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
      partCount,
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
          `Upload part ${partNumber + 1} gagal: ${res.statusText}`,
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
      partsMeta,
    );
    console.log(
      `🎉 [MINIO] File uploaded to MinIO: ${bucketName}/${objectName}`,
    );

    // Info size
    const stat = await client.statObject(bucketName, objectName);
    const fileSizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log("📏 [MINIO] File size:", fileSizeMB, "MB");
  }
}
