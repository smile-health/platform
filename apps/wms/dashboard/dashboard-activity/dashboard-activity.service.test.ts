import { beforeEach, describe, expect, it, vi } from "vitest";

// exceljs's own build trips up vite-node's SSR transform in this workspace
// (unrelated to this module's code) — stub it with a minimal fake workbook
// that supports exactly the Workbook/Worksheet API surface
// dashboard-activity.service.ts uses, so the export test can exercise real
// service logic (date-range validation, buffer/filename shape) without
// depending on the real xlsx-writer.
vi.mock("exceljs", () => {
  class FakeCell {
    value: unknown;
    alignment: unknown;
    font: unknown;
    fill: unknown;
    border: unknown;
  }
  class FakeRow {
    number: number;
    height?: number;
    font?: unknown;
    private cells = new Map<number, FakeCell>();
    constructor(number: number) {
      this.number = number;
    }
    getCell(i: number): FakeCell {
      if (!this.cells.has(i)) this.cells.set(i, new FakeCell());
      return this.cells.get(i)!;
    }
    eachCell(fn: (cell: FakeCell) => void) {
      this.cells.forEach(fn);
    }
  }
  class FakeColumn {
    width?: number;
    eachCell(_opts: unknown, fn: (cell: FakeCell) => void) {
      fn(new FakeCell());
    }
  }
  class FakeWorksheet {
    rows: FakeRow[] = [];
    columnCount = 5;
    addRow(values: unknown[]): FakeRow {
      const row = new FakeRow(this.rows.length + 1);
      this.rows.push(row);
      values.forEach((v, i) => {
        row.getCell(i + 1).value = v;
      });
      return row;
    }
    getRow(n: number): FakeRow {
      while (this.rows.length < n) this.rows.push(new FakeRow(this.rows.length + 1));
      return this.rows[n - 1];
    }
    getCell(r: number, c: number): FakeCell {
      return this.getRow(r).getCell(c);
    }
    getColumn(_i: number): FakeColumn {
      return new FakeColumn();
    }
    mergeCells(..._args: unknown[]) {}
    eachRow(_opts: unknown, fn: (row: FakeRow) => void) {
      this.rows.forEach(fn);
    }
  }
  class FakeWorkbook {
    creator?: string;
    created?: Date;
    xlsx = { writeBuffer: async () => Buffer.from("fake-xlsx-content") };
    addWorksheet(_name: string): FakeWorksheet {
      return new FakeWorksheet();
    }
  }
  return { default: { Workbook: FakeWorkbook } };
});

vi.mock("./dashboard-activity.repository", () => ({
  getActivitySummariesForEntities: vi.fn(),
  getActivitySummariesForEntitiesRaw: vi.fn(),
  getActivityManualScaleForEntities: vi.fn(),
  getActivityManualScaleForEntitiesRaw: vi.fn(),
  getUserActivitySummary: vi.fn(),
}));

import * as repo from "./dashboard-activity.repository";
import * as service from "./dashboard-activity.service";

describe("dashboard-activity.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActivitySummariesForEntities", () => {
    it("returns paginated data with default pagination (limit=10,page=1) when not provided", async () => {
      (repo.getActivitySummariesForEntities as any).mockResolvedValue({
        data: [{ healthcareFacilityId: 1, "1": 3 }],
        total: 25,
      });

      const result = await service.getActivitySummariesForEntities({});

      expect(repo.getActivitySummariesForEntities).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        filters: {},
      });
      expect(result).toEqual({
        data: [{ healthcareFacilityId: 1, "1": 3 }],
        pagination: { total: 25, pages: 3, currentPage: 1, perPage: 10 },
      });
    });

    it("clamps limit to the 1000 max and passes through explicit page/limit", async () => {
      (repo.getActivitySummariesForEntities as any).mockResolvedValue({ data: [], total: 0 });

      await service.getActivitySummariesForEntities({}, 5000, 2);

      expect(repo.getActivitySummariesForEntities).toHaveBeenCalledWith({
        limit: 1000,
        page: 2,
        filters: {},
      });
    });

    it("falls back to limit=10 for a non-integer/zero/negative limit", async () => {
      (repo.getActivitySummariesForEntities as any).mockResolvedValue({ data: [], total: 0 });

      await service.getActivitySummariesForEntities({}, -5, 0);

      expect(repo.getActivitySummariesForEntities).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        filters: {},
      });
    });

    it("passes filters through untouched to the repository", async () => {
      (repo.getActivitySummariesForEntities as any).mockResolvedValue({ data: [], total: 0 });

      const filters = {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        provinceId: 1,
        typeOfProcessing: "IN",
      };
      await service.getActivitySummariesForEntities(filters, 20, 3);

      expect(repo.getActivitySummariesForEntities).toHaveBeenCalledWith({
        limit: 20,
        page: 3,
        filters,
      });
    });
  });

  describe("getActivityManualScaleForEntities", () => {
    it("returns paginated data with default pagination", async () => {
      (repo.getActivityManualScaleForEntities as any).mockResolvedValue({
        data: [{ healthcareFacilityId: 2 }],
        total: 1,
      });

      const result = await service.getActivityManualScaleForEntities({});

      expect(result).toEqual({
        data: [{ healthcareFacilityId: 2 }],
        pagination: { total: 1, pages: 1, currentPage: 1, perPage: 10 },
      });
    });
  });

  describe("getUserActivitySummary", () => {
    it("delegates straight to the repository and returns its result", async () => {
      (repo.getUserActivitySummary as any).mockResolvedValue({
        totalEntities: 10,
        activeEntities: 4,
        inactiveEntities: 6,
      });

      const result = await service.getUserActivitySummary({ provinceId: 1 });

      expect(repo.getUserActivitySummary).toHaveBeenCalledWith({ provinceId: 1 });
      expect(result).toEqual({ totalEntities: 10, activeEntities: 4, inactiveEntities: 6 });
    });
  });

  describe("exportActivitySummariesForEntities", () => {
    it("throws a plain Error (not APIError) when startDate is missing", async () => {
      await expect(
        service.exportActivitySummariesForEntities({ endDate: "2024-01-31" }),
      ).rejects.toThrow("startDate and endDate are required.");
    });

    it("throws a plain Error (not APIError) when endDate is missing", async () => {
      await expect(
        service.exportActivitySummariesForEntities({ startDate: "2024-01-01" }),
      ).rejects.toThrow("startDate and endDate are required.");
    });

    it("throws a plain Error, never an APIError, for the missing-date case", async () => {
      try {
        await service.exportActivitySummariesForEntities({});
        expect.unreachable();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as { name?: string }).constructor.name).not.toBe("APIError");
      }
    });

    it("builds an .xlsx buffer and a filename derived from the date range when dates are present", async () => {
      (repo.getActivitySummariesForEntitiesRaw as any).mockResolvedValue([
        {
          healthcareFacilityId: 1,
          provinceName: "Jakarta",
          regencyName: "Jakarta Selatan",
          healthcareFacilityName: "RS A",
          "1": 2,
          "2": 0,
        },
      ]);
      (repo.getActivityManualScaleForEntitiesRaw as any).mockResolvedValue([
        { healthcareFacilityId: 1, "1": 1, "2": 0 },
      ]);

      const result = await service.exportActivitySummariesForEntities({
        startDate: "2024-01-01",
        endDate: "2024-01-02",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.filename).toMatch(/^activity_summary_2024-01-01_2024-01-02_\d{8}_\d{6}\.xlsx$/);
    });
  });

  describe("buildContentDisposition", () => {
    it("produces both the ascii and RFC 5987 filename forms", () => {
      const header = service.buildContentDisposition("activity summary.xlsx");
      expect(header).toContain('filename="activity summary.xlsx"');
      expect(header).toContain("filename*=UTF-8''activity%20summary.xlsx");
    });
  });
});
