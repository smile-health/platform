import {
  createReadStream,
  createWriteStream,
  existsSync,
  statSync,
  unlinkSync,
  mkdirSync,
  rmSync,
  readdirSync,
  copyFileSync,
} from "fs";
import { join, basename } from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { randomUUID } from "crypto";
import * as JSZip from "jszip";
import archiver from "archiver";
import { Client } from "minio";
import * as ExcelJS from "exceljs";
import { Column, Filter, PROCESSOR } from "./types.js";
import { cleanSheetName } from "../utils.js";
import { parseStringPromise } from "xml2js";
import { sanitizeCell } from "./util.js";

const pipelineAsync = promisify(pipeline);

export interface MultiSheetZipExportOptions {
  language: string;
  timezone?: string;
  batchSize?: number;
  bucketName?: string;
  partSizeMB?: number;
  tempDir?: string;
  useZip?: boolean; // Default: true. If false, upload Excel files directly without zipping
  totalRecords?: number; // For auto-determining if ZIP is needed (>1M records = must zip)
  originalFilename?: string; // Optional: corrected filename to use for upload (overrides internal logic)
  filename?: string; // Optional: custom filename for Excel files inside ZIP (e.g., "Transaksi_1773397267933")
}

export interface FileGroup {
  title: string;
  titleBar?: Record<string, string>;
  columns: Record<string, Column[]>;
  filters?: Record<string, Filter[]>;
  // Streaming support
  workbookWriter?: ExcelJS.stream.xlsx.WorkbookWriter;
  worksheets: Record<string, ExcelJS.Worksheet | undefined>;
  rowCount: Record<string, number>;
  totalRowsInGroup: number; // Track total rows across ALL sheets
  partIndex: number;
  tempFiles: string[];
  currentTempPath?: string;
}

export class MultiSheetZipExporter {
  private batchSize: number;
  private fileGroups: Record<string, FileGroup>;
  private bucketName: string;
  private partSizeMB: number;
  private tempDir: string;
  private instanceId: string;
  private useZip: boolean;
  private totalRecords: number;
  private originalFilename?: string; // Store corrected filename
  private filename?: string; // Store custom filename for Excel files inside ZIP
  private readonly ZIP_THRESHOLD = 1000000; // 1 Million records

  constructor(private options: MultiSheetZipExportOptions) {
    // OPTIMASI: Batch size untuk flush setiap N rows ke disk
    this.batchSize = options.batchSize || 1000;
    this.fileGroups = {};
    this.bucketName = options.bucketName || "smile-platform";
    this.partSizeMB = options.partSizeMB || 10;
    this.totalRecords = options.totalRecords || 0;
    this.originalFilename = options.originalFilename; // Store corrected filename
    this.filename = options.filename; // Store custom filename

    // ✅ SAFEST: Generate unique instance ID untuk setiap exporter
    this.instanceId = `${Date.now()}_${process.pid}_${randomUUID().substring(0, 8)}`;

    // Default tempDir dengan instance ID untuk uniqueness
    const baseTempDir = options.tempDir || "/tmp/excel-exports";
    this.tempDir = join(baseTempDir, this.instanceId);

    // ✅ SMART ZIP: Auto-determine if ZIP is needed
    // - Default: true
    // - If totalRecords > 1M: MUST zip (cannot be disabled)
    // - If totalRecords <= 1M: can be disabled by setting useZip: false
    const mustZip = this.totalRecords > this.ZIP_THRESHOLD;
    const userPreference = options.useZip ?? true;
    this.useZip = mustZip || userPreference;

    if (mustZip && !userPreference) {
      console.warn(
        `[StreamExporter] ⚠️  ZIP forced due to large dataset (${this.totalRecords.toLocaleString()} records > ${this.ZIP_THRESHOLD.toLocaleString()} threshold). ` +
          `useZip option overridden to true.`,
      );
    }

    // Auto-create directory dengan recursive
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }

    console.log(
      `[StreamExporter] Initialized | ` +
        `Instance ID: ${this.instanceId} | ` +
        `Temp dir: ${this.tempDir} | ` +
        `Total records: ${this.totalRecords.toLocaleString()} | ` +
        `Use ZIP: ${this.useZip}${mustZip ? " (forced)" : ""}`,
    );
  }

  public initFileGroup(groupId: string, title: string): this {
    if (this.fileGroups[groupId]) {
      return this;
    }

    this.fileGroups[groupId] = {
      title,
      columns: {},
      worksheets: {},
      rowCount: {},
      totalRowsInGroup: 0,
      partIndex: 1,
      tempFiles: [],
      currentTempPath: undefined,
    };

    return this;
  }

  public async initFileGroupWarehouse(
    groupId: string,
    title: string,
  ): Promise<this> {
    // For warehouse template, use same streaming approach
    return this.initFileGroup(groupId, title);
  }

  public async initSheet(groupId: string, sheetName: string): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    console.log(
      `[StreamExporter] initSheet called: ${groupId}/${cleanedSheetName}`,
    );

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      console.error(
        `[StreamExporter] File group ${groupId} not found! Available: ${Object.keys(this.fileGroups).join(", ")}`,
      );
      throw new Error(`File group ${groupId} not found`);
    }

    // Check if sheet already initialized
    if (fileGroup.worksheets[cleanedSheetName]) {
      return this;
    }

    // Create workbook writer if not exists
    if (!fileGroup.workbookWriter) {
      const timestamp = Date.now();
      const tempFilePath = join(
        this.tempDir,
        `${groupId}_${timestamp}_Part${fileGroup.partIndex}.xlsx`,
      );
      fileGroup.currentTempPath = tempFilePath;

      fileGroup.workbookWriter = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: tempFilePath,
        useSharedStrings: false,
        useStyles: false,
      });
    }

    // Add worksheet
    const worksheet = fileGroup.workbookWriter.addWorksheet(cleanedSheetName);
    fileGroup.worksheets[cleanedSheetName] = worksheet;
    fileGroup.rowCount[cleanedSheetName] = 0;

    return this;
  }

  public async setTitleBar(
    groupId: string,
    sheetName: string,
    columns: Column[],
    title: string,
  ) {
    const cleanedSheetName = cleanSheetName(sheetName);

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    await this.initSheet(groupId, cleanedSheetName);

    if (fileGroup.titleBar) {
      fileGroup.titleBar[cleanedSheetName] = title;
    }
  }

  public async setFilters(
    groupId: string,
    sheetName: string,
    filters: Filter[],
  ) {
    const cleanedSheetName = cleanSheetName(sheetName);

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    await this.initSheet(groupId, cleanedSheetName);

    if (fileGroup.filters) {
      fileGroup.filters[cleanedSheetName] = filters;
    }
  }

  public async setColumns(
    groupId: string,
    sheetName: string,
    columns: Column[],
    startCell = "A1",
  ): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    await this.initSheet(groupId, cleanedSheetName);

    fileGroup.columns[cleanedSheetName] = columns;

    // Apply columns to worksheet
    const worksheet = fileGroup.worksheets[cleanedSheetName];
    if (worksheet) {
      // Set column widths
      columns.forEach((col, index) => {
        const colLetter = this.columnIndexToLetter(index + 1);
        const column = worksheet.getColumn(colLetter);
        if (col.width && column) {
          column.width = col.width;
        }
      });

      // Add header row
      const headers = columns.map((col) => col.header);
      const headerRow = worksheet.addRow(headers);
      headerRow.commit();
      fileGroup.rowCount[cleanedSheetName] = 1;
    } else {
      console.warn(`[StreamExporter] Worksheet ${cleanedSheetName} not found!`);
    }

    return this;
  }

  private columnIndexToLetter(index: number): string {
    let letter = "";
    while (index > 0) {
      index--;
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26);
    }
    return letter;
  }

  /**
   * Add value to a specific cell with optional styling
   * @param groupId - File group ID
   * @param sheetName - Sheet name
   * @param cellAddress - Cell address (e.g., "A1", "B2")
   * @param value - Cell value
   * @param style - Optional style object (bold, alignment, border, etc.)
   * @param mergeToCell - Optional end cell address for merging (e.g., "E1" to merge A1:E1)
   */
  public async addCell(
    groupId: string,
    sheetName: string,
    cellAddress: string,
    value: unknown,
    style?: {
      bold?: boolean;
      italic?: boolean;
      horizontalAlignment?:
        | "left"
        | "center"
        | "right"
        | "fill"
        | "distributed";
      verticalAlignment?: "top" | "middle" | "bottom" | "distributed";
      border?: {
        top?: { style: string; color: string };
        bottom?: { style: string; color: string };
        left?: { style: string; color: string };
        right?: { style: string; color: string };
      };
      fill?: {
        type: "pattern";
        pattern: string;
        fgColor: { argb: string };
      };
      font?: {
        color?: { argb: string };
        size?: number;
        name?: string;
      };
    },
    mergeToCell?: string,
  ): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    // Ensure sheet is initialized
    if (!fileGroup.worksheets[cleanedSheetName]) {
      await this.initSheet(groupId, cleanedSheetName);
    }

    const worksheet = fileGroup.worksheets[cleanedSheetName];
    if (!worksheet) {
      throw new Error(`Worksheet ${cleanedSheetName} not found`);
    }

    // Get cell
    const cell = worksheet.getCell(cellAddress);

    // Set value
    cell.value = value;

    // Apply style
    if (style) {
      if (style.bold !== undefined) {
        cell.font = { ...cell.font, bold: style.bold };
      }
      if (style.italic !== undefined) {
        cell.font = { ...cell.font, italic: style.italic };
      }
      if (style.font) {
        cell.font = { ...cell.font, ...style.font };
      }
      if (style.horizontalAlignment) {
        cell.alignment = {
          ...cell.alignment,
          horizontal: style.horizontalAlignment,
        };
      }
      if (style.verticalAlignment) {
        cell.alignment = {
          ...cell.alignment,
          vertical: style.verticalAlignment,
        };
      }
      if (style.border) {
        cell.border = style.border;
      }
      if (style.fill) {
        cell.fill = style.fill;
      }
    }

    // Merge cells if specified
    if (mergeToCell) {
      worksheet.mergeCells(`${cellAddress}:${mergeToCell}`);
    }

    // Update row count if this is a new row
    const rowMatch = cellAddress.match(/[A-Z]+(\d+)/);
    if (rowMatch) {
      const rowNum = parseInt(rowMatch[1], 10);
      if (rowNum > (fileGroup.rowCount[cleanedSheetName] || 0)) {
        fileGroup.rowCount[cleanedSheetName] = rowNum;
      }
    }

    return this;
  }

  /**
   * Merge cells in a range
   * @param groupId - File group ID
   * @param sheetName - Sheet name
   * @param range - Cell range (e.g., "A1:E1")
   */
  public async mergeCells(
    groupId: string,
    sheetName: string,
    range: string,
  ): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    const worksheet = fileGroup.worksheets[cleanedSheetName];
    if (!worksheet) {
      throw new Error(`Worksheet ${cleanedSheetName} not found`);
    }

    worksheet.mergeCells(range);

    return this;
  }

  /**
   * Set column width
   * @param groupId - File group ID
   * @param sheetName - Sheet name
   * @param columnLetter - Column letter (e.g., "A", "B", "AA")
   * @param width - Column width
   */
  public async setColumnWidth(
    groupId: string,
    sheetName: string,
    columnLetter: string,
    width: number,
  ): Promise<this> {
    const cleanedSheetName = cleanSheetName(sheetName);

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    const worksheet = fileGroup.worksheets[cleanedSheetName];
    if (!worksheet) {
      throw new Error(`Worksheet ${cleanedSheetName} not found`);
    }

    const column = worksheet.getColumn(columnLetter);
    if (column) {
      column.width = width;
    }

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

    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup) {
      throw new Error(`File group ${groupId} not found`);
    }

    if (!fileGroup.worksheets[cleanedSheetName]) {
      throw new Error(`Worksheet ${cleanedSheetName} not found`);
    }

    if (Array.isArray(rows)) {
      // OPTIMASI: Streaming per-row, langsung commit dan flush ke disk
      if (fileGroup.rowCount[cleanedSheetName] === undefined) {
        fileGroup.rowCount[cleanedSheetName] = 0;
      }
      for (const row of rows) {
        // ✅ V4 FIX: Always check if worksheet is still valid before adding row
        let currentWorksheet = fileGroup.worksheets[cleanedSheetName];
        if (!currentWorksheet || !currentWorksheet.properties) {
          // Worksheet was flushed/committed, throw error to prevent corruption
          throw new Error(
            `Worksheet ${cleanedSheetName} is no longer valid (was flushed). Cannot add more rows.`,
          );
        }

        // Map row data to array based on column order
        const columns = fileGroup.columns[cleanedSheetName];
        if (columns) {
          const values = columns.map((col) => {
            // Find matching key in row (case-insensitive)
            const key = Object.keys(row).find(
              (k) => k.toLowerCase() === (col.key || col.header).toLowerCase(),
            );
            return key !== undefined ? sanitizeCell(row[key]) : null;
          });
          currentWorksheet.addRow(values).commit();
        } else {
          // If no columns defined, use object values
          currentWorksheet.addRow(Object.values(row).map(sanitizeCell)).commit();
        }

         const rowCount = ++fileGroup.rowCount[cleanedSheetName];
         const totalRowsInGroup = ++fileGroup.totalRowsInGroup;

         // Check if need to flush to new part (based on TOTAL rows across all sheets)
         if (totalRowsInGroup % this.batchSize === 0) {
           await this.flushToNewPart(groupId);
         }
      }
    } else {
      // Handle async iterable
      let count = 0;
      if (fileGroup.rowCount[cleanedSheetName] === undefined) {
        fileGroup.rowCount[cleanedSheetName] = 0;
      }

      let sampleRowLogged = false;

      for await (const row of rows as AsyncIterableIterator<
        Record<string, unknown>
      >) {
        // ✅ V4 FIX: Always check if worksheet is still valid before adding row
        let currentWorksheet = fileGroup.worksheets[cleanedSheetName];
        if (!currentWorksheet || !currentWorksheet.properties) {
          // Worksheet was flushed/committed, throw error to prevent corruption
          throw new Error(
            `Worksheet ${cleanedSheetName} is no longer valid (was flushed). Cannot add more rows.`,
          );
        }

        const columns = fileGroup.columns[cleanedSheetName];
        if (columns) {
          const values = columns.map((col) => {
            const key = Object.keys(row).find(
              (k) => k.toLowerCase() === (col.key || col.header).toLowerCase(),
            );
            return key !== undefined ? sanitizeCell(row[key]) : null;
          });

          const worksheetRow = currentWorksheet.addRow(values);
          worksheetRow.commit();

          if (!sampleRowLogged && count < 3) {
            sampleRowLogged = true;
          }
        } else {
          currentWorksheet.addRow(Object.values(row).map(sanitizeCell)).commit();
        }

         const currentRowCount = ++fileGroup.rowCount[cleanedSheetName];
         const totalRowsInGroup = ++fileGroup.totalRowsInGroup;
         count++;

         if (totalRowsInGroup % this.batchSize === 0) {
           await this.flushToNewPart(groupId);
         }

        if (count % 1000 === 0) {
          console.log(
            `Processed ${count} rows from async iterable for ${groupId}/${cleanedSheetName}`,
          );
        }
      }

      // Flush remaining rows if any
      const finalRowCount = fileGroup.rowCount[cleanedSheetName];
      if (finalRowCount && finalRowCount % this.batchSize !== 0) {
        console.log(
          `[StreamExporter] ${finalRowCount} rows remaining (will be flushed in finalizeToDisk)`,
        );
        // Rows will be flushed in finalizeToDisk
      }
    }

    return this;
  }

  /**
   * Flush current data to disk and create new part
   * ✅ MODIFIED: Flush ALL sheets in group together (not individual sheet)
   * This keeps multiple sheets in a single Excel file while maintaining memory efficiency
   */
  private async flushToNewPart(
    groupId: string,
  ): Promise<void> {
    const fileGroup = this.fileGroups[groupId];
    if (!fileGroup || !fileGroup.workbookWriter) {
      return;
    }

    // ✅ Commit ALL worksheets in this group
    const sheetNames = Object.keys(fileGroup.worksheets);
    console.log(
      `[StreamExporter] Flushing ${sheetNames.length} sheets from group ${groupId}...`,
    );
    
    for (const sheetName of sheetNames) {
      const worksheet = fileGroup.worksheets[sheetName];
      if (worksheet) {
        await worksheet.commit();
        console.log(
          `[StreamExporter] - Committed sheet ${sheetName} (${fileGroup.rowCount[sheetName]} rows)`,
        );
      }
    }

    // Close current workbook writer
    await fileGroup.workbookWriter.commit();

    // Save temp file path
    if (fileGroup.currentTempPath) {
      fileGroup.tempFiles.push(fileGroup.currentTempPath);
      const totalRows = Object.values(fileGroup.rowCount).reduce((a, b) => a + b, 0);
      console.log(
        `[StreamExporter] Flushed part ${fileGroup.partIndex} to disk: ${fileGroup.currentTempPath} (${totalRows} total rows across ${sheetNames.length} sheets)`,
      );
    }

    // Create new workbook writer for next part
    fileGroup.partIndex++;
    const timestamp = Date.now();
    const newTempPath = join(
      this.tempDir,
      `${groupId}_${timestamp}_Part${fileGroup.partIndex}.xlsx`,
    );
    fileGroup.currentTempPath = newTempPath;
    fileGroup.workbookWriter = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: newTempPath,
      useSharedStrings: false,
      useStyles: false,
    });

    // ✅ Re-create ALL worksheets with same columns
    for (const sheetName of sheetNames) {
      const newWorksheet = fileGroup.workbookWriter.addWorksheet(sheetName);
      fileGroup.worksheets[sheetName] = newWorksheet;

      // Re-add headers
      const columns = fileGroup.columns[sheetName];
      if (columns) {
        const headers = columns.map((col) => col.header);
        newWorksheet.addRow(headers).commit();
        fileGroup.rowCount[sheetName] = 1; // Reset count (header already added)

        // Re-apply column widths
        columns.forEach((col, index) => {
          const colLetter = this.columnIndexToLetter(index + 1);
          const column = newWorksheet.getColumn(colLetter);
          if (col.width && column) {
            column.width = col.width;
          }
        });
      } else {
        fileGroup.rowCount[sheetName] = 0;
      }
    }

    // ✅ Reset total rows counter for new part
    fileGroup.totalRowsInGroup = sheetNames.length; // Start with header rows only

    // OPTIMASI: Trigger GC if available
    if (global.gc) {
      global.gc();
    }
  }

  public async finalize(): Promise<JSZip> {
    // For backward compatibility, but finalizeToDisk should be used instead
    const result = await this.finalizeToDisk();
    const zip = new (JSZip as any)();

    // Add all temp files to zip (in memory - not recommended for large files)
    for (const [groupId, files] of Object.entries(result.tempFiles)) {
      for (let i = 0; i < files.length; i++) {
        const tempFile = files[i];
        if (tempFile && existsSync(tempFile)) {
          const fileName = `${groupId}_Part${i + 1}.xlsx`;
          const content = createReadStream(tempFile);
          zip.file(fileName, content);
        }
      }
    }

    return zip;
  }

  /**
   * Finalize: flush remaining rows and collect all temporary files
   */
  public async finalizeToDisk(): Promise<{
    tempFiles: Record<string, string[]>;
  }> {
    console.log(`[StreamExporter] === FINALIZE TO DISK STARTED ===`);
    console.log(
      `[StreamExporter] File groups to finalize: ${Object.keys(this.fileGroups).join(", ")}`,
    );

    const groupIds = Object.keys(this.fileGroups);
    const result: Record<string, string[]> = {};

    for (const groupId of groupIds) {
      const fileGroup = this.fileGroups[groupId];
      if (!fileGroup) {
        console.warn(
          `[StreamExporter] File group ${groupId} not found, skipping...`,
        );
        result[groupId] = [];
        continue;
      }

      console.log(`[StreamExporter] Processing file group: ${groupId}`);
      console.log(
        `[StreamExporter] - Worksheets: ${Object.keys(fileGroup.worksheets).join(", ")}`,
      );
      console.log(`[StreamExporter] - Row counts:`, fileGroup.rowCount);
      console.log(
        `[StreamExporter] - Has workbookWriter: ${!!fileGroup.workbookWriter}`,
      );
      console.log(
        `[StreamExporter] - Temp files so far: ${fileGroup.tempFiles.length}`,
      );
      console.log(
        `[StreamExporter] - Current temp path: ${fileGroup.currentTempPath || "none"}`,
      );

      // Skip if no workbook writer (already finalized)
      if (!fileGroup.workbookWriter) {
        console.log(
          `[StreamExporter] No workbookWriter for ${groupId}, using existing temp files`,
        );
        result[groupId] = fileGroup.tempFiles;
        continue;
      }

      // ✅ PENTING: Commit semua worksheets terlebih dahulu
      console.log(
        `[StreamExporter] Committing all worksheets for ${groupId}...`,
      );
      for (const sheetName of Object.keys(fileGroup.worksheets)) {
        const worksheet = fileGroup.worksheets[sheetName];
        if (worksheet) {
          console.log(`[StreamExporter] - Committing worksheet: ${sheetName}`);
          await worksheet.commit();
        }
      }

      // ✅ PENTING: Commit workbook writer untuk close file dengan benar
      console.log(
        `[StreamExporter] Committing workbook writer for ${groupId}...`,
      );
      await fileGroup.workbookWriter.commit();

      // Save the last part
      if (fileGroup.currentTempPath) {
        console.log(
          `[StreamExporter] Saving final part: ${fileGroup.currentTempPath}`,
        );
        // Verify file exists
        if (existsSync(fileGroup.currentTempPath)) {
          const stats = statSync(fileGroup.currentTempPath);
          console.log(
            `[StreamExporter] Final part size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          );
          fileGroup.tempFiles.push(fileGroup.currentTempPath);
          console.log(
            `[StreamExporter] Finalized part ${fileGroup.partIndex}: ${fileGroup.currentTempPath}`,
          );
        } else {
          console.error(
            `[StreamExporter] ⚠️  Final part file doesn't exist: ${fileGroup.currentTempPath}`,
          );
        }
      } else {
        console.warn(`[StreamExporter] No currentTempPath for ${groupId}!`);
      }

       // Clear workbook writer reference
       fileGroup.workbookWriter = undefined;
       fileGroup.currentTempPath = undefined;
       fileGroup.totalRowsInGroup = 0; // Reset for next cycle if needed
       result[groupId] = fileGroup.tempFiles;

      console.log(
        `[StreamExporter] File group ${groupId} finalized with ${result[groupId].length} temp file(s)`,
      );
    }

    console.log(`[StreamExporter] === FINALIZE TO DISK COMPLETED ===`);
    console.log(
      `[StreamExporter] Final temp files:`,
      JSON.stringify(result, null, 2),
    );

    return { tempFiles: result };
  }

  /**
   * Create ZIP from temporary files (streaming from disk) and upload to Minio
   * If useZip is false, upload Excel files directly without zipping
   * OPTIMASI: Using archiver for streaming ZIP (reduce memory)
   */
  public async createZipAndUpload(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string,
    onProgress?: (progress: {
      stage: string;
      percentage: number;
      message?: string;
    }) => Promise<void>,
  ): Promise<string> {
    console.log(`[StreamExporter] Calling finalizeToDisk before upload...`);
    const { tempFiles } = await this.finalizeToDisk();

    // ✅ Use corrected filename from options if available
    const uploadFilename = this.originalFilename || originalFilename;

    if (this.useZip) {
      // ✅ ZIP MODE: Create ZIP and upload
      return this.createZipAndUploadWithZip(
        minioClient,
        endpointUrl,
        uploadFilename,
        tempFiles, // ✅ Pass tempFiles dari finalizeToDisk
        onProgress,
      );
    } else {
      // ✅ NO-ZIP MODE: Upload Excel files directly
      return this.uploadExcelFilesDirectly(
        minioClient,
        endpointUrl,
        uploadFilename,
        tempFiles, // ✅ Pass tempFiles dari finalizeToDisk
        onProgress,
      );
    }
  }

  /**
   * ZIP MODE: Create ZIP from temporary files and upload to Minio
   */
  private async createZipAndUploadWithZip(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string,
    tempFiles: Record<string, string[]>,
    onProgress?: (progress: {
      stage: string;
      percentage: number;
      message?: string;
    }) => Promise<void>,
  ): Promise<string> {
    // Verify temp files exist
    let totalParts = 0;
    for (const files of Object.values(tempFiles)) {
      totalParts += files.length;
    }
    console.log(`[StreamExporter] Total parts to upload: ${totalParts}`);

    if (totalParts === 0) {
      console.error(
        `[StreamExporter] ⚠️  WARNING: No temp files found! ZIP will be empty!`,
      );
    }

    const zipFilePath = join(
      this.tempDir,
      `${originalFilename}_${Date.now()}.zip`,
    );
    const output = createWriteStream(zipFilePath);

    console.log(`[StreamExporter] ZIP file path: ${zipFilePath}`);

    // OPTIMASI: Use archiver for streaming ZIP (not load all files to memory)
    const archive = archiver("zip", { zlib: { level: 6 } });

    archive.pipe(output);

    archive.on("error", (err) => {
      console.error("[StreamExporter] Archive error:", err);
      throw err;
    });

    let addedParts = 0;

    console.log(
      `[StreamExporter] Starting to add ${totalParts} parts to ZIP...`,
    );

    // Determine base filename for Excel files inside ZIP
    // If custom filename is provided, use it; otherwise use groupId
    const useCustomFilename = !!this.filename;
    const baseFilename = this.filename || "";

    for (const [groupId, files] of Object.entries(tempFiles)) {
      console.log(
        `[StreamExporter] Adding ${files.length} parts from group ${groupId} to ZIP`,
      );
      console.log(`[StreamExporter] Temp files for ${groupId}:`, files);

      for (let i = 0; i < files.length; i++) {
        const tempFile = files[i];
        if (tempFile && existsSync(tempFile)) {
          // Use custom filename format if provided, otherwise use groupId
          const fileName = useCustomFilename
            ? `${baseFilename}_Part${i + 1}.xlsx`
            : `${groupId}_Part${i + 1}.xlsx`;

          const stats = statSync(tempFile);
          console.log(
            `[StreamExporter] Adding ${fileName} to ZIP (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
          );
          archive.file(tempFile, { name: fileName });
          addedParts++;
          console.log(
            `[StreamExporter] Added ${fileName} to ZIP (${addedParts}/${totalParts})`,
          );
        } else {
          console.warn(`[StreamExporter] Temp file not found: ${tempFile}`);
        }
      }
    }

    console.log(`[StreamExporter] Finalizing ZIP archive...`);
    await archive.finalize();

    await new Promise<void>((resolve, reject) => {
      output.on("close", () => {
        console.log(
          `[StreamExporter] ZIP created: ${zipFilePath} (${(statSync(zipFilePath).size / 1024 / 1024).toFixed(2)} MB)`,
        );
        resolve();
      });
      output.on("error", reject);
    });

    console.log(`[StreamExporter] Uploading ZIP to Minio...`);
    await this.uploadFileToMinio(
      minioClient,
      originalFilename,
      zipFilePath,
      this.bucketName,
      this.partSizeMB,
      onProgress,
    );

    console.log(`[StreamExporter] ZIP uploaded to Minio successfully!`);

    console.log(`[StreamExporter] Cleaning up temporary files...`);
    this.cleanupTempFiles(tempFiles);

    const uploadUrl = `${endpointUrl}/${this.bucketName}/${originalFilename}`;
    console.log(`[StreamExporter] Upload completed. URL: ${uploadUrl}`);

    return uploadUrl;
  }

  /**
   * NO-ZIP MODE: Upload Excel files directly to Minio without zipping
   * Each Excel part is uploaded as a separate file
   *
   * IMPORTANT: When there's only 1 file (single Excel without ZIP),
   * use the originalFilename directly (without _Part1 suffix) to maintain
   * consistency with the original_filename stored in export_histories.
   *
   * When there are multiple files (split into parts), use the custom filename
   * format with _Part{N} suffix.
   */
  private async uploadExcelFilesDirectly(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string,
    tempFiles: Record<string, string[]>,
    onProgress?: (progress: {
      stage: string;
      percentage: number;
      message?: string;
    }) => Promise<void>,
  ): Promise<string> {
    console.log(`[StreamExporter] === UPLOAD EXCEL FILES DIRECTLY STARTED ===`);

    let totalFiles = 0;
    let uploadedFiles = 0;
    let firstUploadedFile: string | null = null;

    // Count total files
    for (const files of Object.values(tempFiles)) {
      totalFiles += files.length;
    }

    console.log(`[StreamExporter] Total files to upload: ${totalFiles}`);

    // Determine base filename for Excel files
    // If custom filename is provided, use it; otherwise use originalFilename
    const useCustomFilename = !!this.filename;
    const baseFilename = this.filename || originalFilename.replace(".zip", "");

    // ✅ FIX: When single file (no ZIP), use originalFilename directly
    // This ensures consistency with export_histories.original_filename
    const isSingleFile = totalFiles === 1;

    // Upload each Excel file directly
    for (const [groupId, files] of Object.entries(tempFiles)) {
      console.log(
        `[StreamExporter] Uploading ${files.length} Excel files from group ${groupId}`,
      );

      for (let i = 0; i < files.length; i++) {
        const tempFile = files[i];
        if (tempFile && existsSync(tempFile)) {
          let fileName: string;

          if (isSingleFile) {
            // ✅ Single file: use originalFilename directly (e.g., "UUID.xlsx")
            fileName = originalFilename;
            console.log(
              `[StreamExporter] Single file mode: using original filename "${fileName}"`,
            );
          } else {
            // ✅ Multiple files: use custom filename with _Part{N} suffix
            fileName = useCustomFilename
              ? `${baseFilename}_Part${i + 1}.xlsx`
              : `${originalFilename.replace(".zip", "")}_Part${i + 1}.xlsx`;
            console.log(
              `[StreamExporter] Multi-file mode: using filename "${fileName}"`,
            );
          }

          console.log(
            `[StreamExporter] Uploading ${fileName} (${(statSync(tempFile).size / 1024 / 1024).toFixed(2)} MB)...`,
          );

          await this.uploadFileToMinio(
            minioClient,
            fileName,
            tempFile,
            this.bucketName,
            this.partSizeMB,
            async (progress) => {
              const overallProgress = Math.round(
                ((uploadedFiles + progress.percentage / 100) / totalFiles) *
                  100,
              );
              if (onProgress) {
                await onProgress({
                  ...progress,
                  percentage: overallProgress,
                  message: `Uploading ${fileName}: ${progress.message}`,
                });
              }
            },
          );

          uploadedFiles++;

          // Store first file URL for return value
          if (!firstUploadedFile) {
            firstUploadedFile = fileName;
          }

          console.log(
            `[StreamExporter] Uploaded ${fileName} (${uploadedFiles}/${totalFiles})`,
          );

          // Delete temp file after successful upload
          try {
            unlinkSync(tempFile);
            console.log(`[StreamExporter] Deleted temp file: ${tempFile}`);
          } catch (error) {
            console.error(
              `[StreamExporter] Error deleting temp file ${tempFile}:`,
              error,
            );
          }
        } else {
          console.warn(`[StreamExporter] Temp file not found: ${tempFile}`);
        }
      }
    }

    console.log(`[StreamExporter] All Excel files uploaded successfully!`);

    // Cleanup remaining directory
    this.cleanupTempFiles(tempFiles);

    // Return URL to first uploaded file
    if (!firstUploadedFile) {
      throw new Error("No files were uploaded");
    }
    return `${endpointUrl}/${this.bucketName}/${firstUploadedFile}`;
  }

  public cleanupTempFiles(tempFiles?: Record<string, string[]>): void {
    console.log(
      `[StreamExporter] Cleaning up temporary files for instance: ${this.instanceId}`,
    );

    // Use provided tempFiles or fall back to fileGroups
    const filesToClean =
      tempFiles || Object.values(this.fileGroups).flatMap((fg) => fg.tempFiles);

    // Flatten if it's a Record (from finalizeToDisk)
    const allTempFiles = Array.isArray(filesToClean)
      ? filesToClean
      : Object.values(filesToClean).flatMap((files) => files);

    console.log(`[StreamExporter] Files to clean up: ${allTempFiles.length}`);

    // Delete individual temp files
    for (const tempFile of allTempFiles) {
      try {
        if (tempFile && existsSync(tempFile)) {
          unlinkSync(tempFile);
          console.log(`[StreamExporter] Deleted temp file: ${tempFile}`);
        }
      } catch (error) {
        console.error(
          `[StreamExporter] Error deleting temp file ${tempFile}:`,
          error,
        );
      }
    }

    // ✅ SAFEST: Delete entire instance directory
    try {
      if (existsSync(this.tempDir)) {
        // Delete all files in directory
        const files = readdirSync(this.tempDir);
        for (const file of files) {
          const filePath = join(this.tempDir, file);
          try {
            unlinkSync(filePath);
            console.log(`[StreamExporter] Deleted file: ${filePath}`);
          } catch (error) {
            console.error(
              `[StreamExporter] Error deleting file ${filePath}:`,
              error,
            );
          }
        }

        // Delete directory itself
        rmSync(this.tempDir, { recursive: true, force: true });
        console.log(
          `[StreamExporter] Deleted instance directory: ${this.tempDir}`,
        );
      }
    } catch (error) {
      console.error(
        `[StreamExporter] Error cleaning up instance directory:`,
        error,
      );
    }

    // Also cleanup any orphaned ZIP files in parent directory
    try {
      const parentDir = join(this.tempDir, "..");
      const zipFiles = readdirSync(parentDir).filter(
        (f) => f.endsWith(".zip") && f.includes(this.instanceId),
      );
      for (const zipFile of zipFiles) {
        const zipPath = join(parentDir, zipFile);
        if (existsSync(zipPath)) {
          unlinkSync(zipPath);
          console.log(`[StreamExporter] Deleted ZIP file: ${zipPath}`);
        }
      }
    } catch (error) {
      console.error(`[StreamExporter] Error cleaning up ZIP files:`, error);
    }
  }

  public async generateAndSaveZipFile(
    originalFilename: string,
  ): Promise<string> {
    console.log(`[StreamExporter] === GENERATE AND SAVE ZIP FILE STARTED ===`);
    console.log(`[StreamExporter] Original filename: ${originalFilename}`);
    console.log(`[StreamExporter] useZip flag: ${this.useZip}`);

    // Finalize first to ensure all cells are committed to disk
    const result = await this.finalizeToDisk();

    console.log(
      `[StreamExporter] Temp files from finalize:`,
      JSON.stringify(result.tempFiles, null, 2),
    );

    // ✅ CHECK useZip flag - if false, upload Excel directly
    if (!this.useZip) {
      console.log(
        `[StreamExporter] useZip is FALSE - uploading Excel directly`,
      );

      // Get the single Excel file (should be only 1 for < 100K records)
      const fileGroups = Object.entries(result.tempFiles);
      if (fileGroups.length === 0) {
        throw new Error("No temp files found for direct Excel upload");
      }

      const firstGroup = fileGroups[0];
      if (!firstGroup || firstGroup[1].length === 0) {
        throw new Error("No temp files found for direct Excel upload");
      }

      const excelFile = firstGroup[1][0];

      if (!excelFile || !existsSync(excelFile)) {
        throw new Error(`Temp Excel file not found: ${excelFile}`);
      }

      // Rename to proper extension if needed
      const cleanFilename = originalFilename
        .replace(/\.zip$/i, "")
        .replace(/\.xlsx$/i, "");
      const parentDir = join(this.tempDir, "..");
      const excelFilePath = join(parentDir, `${cleanFilename}.xlsx`);

      // Copy/rename temp file to final location
      copyFileSync(excelFile, excelFilePath);

      console.log(`[StreamExporter] Excel file ready at: ${excelFilePath}`);

      // Cleanup temp files
      this.cleanupTempFiles(result.tempFiles);

      return excelFilePath;
    }

    // ✅ ZIP MODE: Create ZIP file
    console.log(`[StreamExporter] useZip is TRUE - creating ZIP file`);

    // Remove .zip extension if already present to avoid .zip.zip
    const cleanFilename = originalFilename.replace(/\.zip$/i, "");

    // ✅ PENTING: Buat ZIP file di LUAR instance directory agar tidak terhapus saat cleanup
    const parentDir = join(this.tempDir, "..");
    const zipFilePath = join(parentDir, `${cleanFilename}.zip`);
    const output = createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 6 } });

    archive.pipe(output);

    console.log(`[StreamExporter] Creating ZIP at: ${zipFilePath}`);
    console.log(`[StreamExporter] Instance directory: ${this.tempDir}`);
    console.log(`[StreamExporter] ZIP directory: ${parentDir}`);

    let totalFiles = 0;
    for (const [groupId, tempFiles] of Object.entries(result.tempFiles)) {
      console.log(
        `[StreamExporter] Group ${groupId}: ${tempFiles.length} file(s)`,
      );
      for (let i = 0; i < tempFiles.length; i++) {
        const tempFile = tempFiles[i];
        if (tempFile && existsSync(tempFile)) {
          // ✅ Use temp filename which includes timestamp (format: groupId_timestamp_partN.xlsx)
          const tempFileName = basename(tempFile);
          const fileName = tempFileName;

          const stats = statSync(tempFile);
          console.log(
            `[StreamExporter] Adding ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
          );
          archive.file(tempFile, { name: fileName });
          totalFiles++;
        } else {
          console.warn(
            `[StreamExporter] Temp file not found or doesn't exist: ${tempFile}`,
          );
        }
      }
    }

    if (totalFiles === 0) {
      console.warn(
        `[StreamExporter] ⚠️  No temp files found! Creating empty Excel file...`,
      );
      // Create a minimal Excel file if no data
      const minimalWorkbook = new ExcelJS.Workbook();
      minimalWorkbook.creator = "SMILE Export Service";
      minimalWorkbook.created = new Date();
      const worksheet = minimalWorkbook.addWorksheet("Empty");
      worksheet.addRow(["No data available"]);

      const minimalExcelPath = join(
        this.tempDir,
        `${cleanFilename}_empty.xlsx`,
      );
      await minimalWorkbook.xlsx.writeFile(minimalExcelPath);

      archive.file(minimalExcelPath, { name: `${cleanFilename}_empty.xlsx` });
      totalFiles = 1;
    }

    await archive.finalize();

    await new Promise<void>((resolve, reject) => {
      output.on("finish", () => {
        const stats = statSync(zipFilePath);
        console.log(
          `✍🏻  ZIP created: ${zipFilePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
        );
        resolve();
      });
      output.on("error", reject);
    });

    // Cleanup temp Excel files ONLY (NOT the ZIP file - it's needed for upload)
    // ZIP file is outside instance directory, so it won't be deleted
    this.cleanupTempFiles(result.tempFiles);

    return zipFilePath;
  }

  public async exportToMinio(
    minioClient: Client,
    endpointUrl: string,
    originalFilename: string,
    onProgress?: (progress: {
      stage: string;
      percentage: number;
      message?: string;
    }) => Promise<void>,
  ): Promise<string> {
    let zipFilePath: string | null = null;

    try {
      console.log(`[StreamExporter] === EXPORT TO MINIO STARTED ===`);

      // ✅ Use corrected filename from constructor if available
      const uploadFilename = this.originalFilename || originalFilename;
      console.log(
        `[StreamExporter] Original filename (parameter): ${originalFilename}`,
      );
      console.log(
        `[StreamExporter] Corrected filename (instance): ${this.originalFilename || "not set"}`,
      );
      console.log(
        `[StreamExporter] Using filename for upload: ${uploadFilename}`,
      );

      zipFilePath = await this.generateAndSaveZipFile(uploadFilename);

      console.log(`[StreamExporter] ZIP file path: ${zipFilePath}`);
      console.log(`[StreamExporter] File exists: ${existsSync(zipFilePath)}`);

      console.log("🪣 Checking/creating bucket:", this.bucketName);
      if (!(await minioClient.bucketExists(this.bucketName))) {
        await minioClient.makeBucket(
          this.bucketName,
          process.env.MINIO_REGION ?? "ap-southeast-3",
        );
      }

      if (!existsSync(zipFilePath)) {
        throw new Error(`📁 File not found: ${zipFilePath}`);
      }

      console.log("🔃 Uploading file to Minio:", zipFilePath);
      await this.uploadFileToMinio(
        minioClient,
        uploadFilename, // objectName - use corrected filename
        zipFilePath, // filePath
        this.bucketName,
        this.partSizeMB,
        onProgress,
      );

      // Delete ZIP file AFTER successful upload
      console.log(
        `[StreamExporter] Deleting ZIP file after successful upload: ${zipFilePath}`,
      );
      unlinkSync(zipFilePath);
      console.log("✅ Upload file to Minio complete. File removed.");

      console.log(`[StreamExporter] === EXPORT TO MINIO COMPLETED ===`);

      return `${endpointUrl}/${this.bucketName}/${uploadFilename}`;
    } catch (error) {
      console.error("❌ Error uploading file to Minio:", error);

      // Cleanup ZIP file on error
      if (zipFilePath && existsSync(zipFilePath)) {
        console.log(
          `[StreamExporter] Cleaning up ZIP file on error: ${zipFilePath}`,
        );
        try {
          unlinkSync(zipFilePath);
        } catch (cleanupError) {
          console.error(
            `[StreamExporter] Error deleting ZIP file: ${cleanupError}`,
          );
        }
      }

      throw error;
    }
  }

  private async streamToString(stream: NodeJS.ReadableStream) {
    return new Promise<string>((resolve, reject) => {
      let data = "";
      stream.on("data", (chunk) => (data += chunk));
      stream.on("end", () => resolve(data));
      stream.on("error", reject);
    });
  }

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

  private async completeMultipartUpload(
    client,
    bucketName,
    objectName,
    uploadId,
    parts,
  ) {
    parts.sort((a, b) => a.partNumber - b.partNumber);

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

  public async uploadFileToMinio(
    client,
    objectName: string,
    filePath: string,
    bucketName: string,
    partSizeMB: number,
    onProgress?: (progress: {
      stage: string;
      percentage: number;
      message?: string;
    }) => Promise<void>,
  ) {
    const partSize = partSizeMB * 1024 * 1024;

    const stats = statSync(filePath);
    const totalSize = stats.size;
    const partCount = Math.ceil(totalSize / partSize);

    const exists = await client.bucketExists(bucketName).catch(() => false);
    if (!exists) await client.makeBucket(bucketName);

    const { uploadId, urls } = await this.createMultipartPresignedUrls(
      client,
      bucketName,
      objectName,
      partCount,
    );

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

      const uploadedSize = (partNumber + 1) * partSize;
      const percentage = Math.min(
        Math.round((uploadedSize / totalSize) * 100),
        100,
      );
      const uploadedMB = (uploadedSize / (1024 * 1024)).toFixed(2);
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

      console.log(
        `✅ [MINIO] Uploaded part ${partNumber + 1}/${partCount} (${percentage}%)`,
      );

      if (onProgress) {
        await onProgress({
          stage: "uploading",
          percentage,
          message: `Uploading to MinIO: ${percentage}% (${uploadedMB}/${totalMB} MB)`,
        });
      }

      partNumber++;
    }

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

    const stat = await client.statObject(bucketName, objectName);
    const fileSizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log("📏 [MINIO] File size:", fileSizeMB, "MB");
  }
}
