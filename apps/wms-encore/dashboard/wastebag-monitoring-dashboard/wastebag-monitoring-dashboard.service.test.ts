import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the repository module before importing the service under test, so no
// real DB connection is ever attempted.
vi.mock("./wastebag-monitoring-dashboard.repository", () => ({
  getWasteGroupSummaryChart: vi.fn(),
  getWasteCharacteristicsSummaryChart: vi.fn(),
  getMonthlyWasteBagSummaryChart: vi.fn(),
  getProvinceWasteBagSummaryChart: vi.fn(),
  getRegencyWasteBagSummaryChart: vi.fn(),
  getEntityWasteBagSummaryChart: vi.fn(),
  getEntityWasteBagSummaryByGroup: vi.fn(),
  getEntityWasteBagSummaryByCharacteristics: vi.fn(),
  getEntityWasteBagSummaryByCharacteristicsExport: vi.fn(),
}));

import * as repo from "./wastebag-monitoring-dashboard.repository";
import { parseBoolean, resolveLang } from "./wastebag-monitoring-dashboard.schema";
import * as service from "./wastebag-monitoring-dashboard.service";

const mockedRepo = repo as unknown as Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("parseBoolean (schema)", () => {
  it("parses truthy strings", () => {
    expect(parseBoolean("true")).toBe(true);
    expect(parseBoolean("1")).toBe(true);
    expect(parseBoolean("yes")).toBe(true);
  });
  it("parses falsy strings", () => {
    expect(parseBoolean("false")).toBe(false);
    expect(parseBoolean("0")).toBe(false);
  });
  it("returns undefined for unrecognized/missing input — matches original's silent fallthrough, no error thrown", () => {
    expect(parseBoolean(undefined)).toBeUndefined();
    expect(parseBoolean("garbage")).toBeUndefined();
  });
});

describe("resolveLang (schema)", () => {
  it("defaults to id when header missing", () => {
    expect(resolveLang(undefined)).toBe("id");
  });
  it("resolves en when accept-language includes en", () => {
    expect(resolveLang("en-US,en;q=0.9")).toBe("en");
  });
  it("resolves id otherwise", () => {
    expect(resolveLang("id-ID")).toBe("id");
  });
});

describe("getWasteGroupSummaryChart", () => {
  it("happy path: sums values and picks id/en labels correctly", async () => {
    mockedRepo.getWasteGroupSummaryChart.mockResolvedValue([
      {
        wasteTypeName: "Medis",
        wasteTypeNameEn: "Medical",
        wasteGroupName: "Infeksius",
        wasteGroupNameEn: "Infectious",
        totalBags: 5,
        totalWeight: 12.5,
      },
    ]);

    const result = await service.getWasteGroupSummaryChart({ isBags: true, lang: "id" });
    expect(result.data).toEqual([{ labelType: "Medis", label: "Infeksius", value: 5 }]);
    expect(result.total).toBe(5);
  });

  it("uses weight instead of bag count when isBags is false", async () => {
    mockedRepo.getWasteGroupSummaryChart.mockResolvedValue([
      {
        wasteTypeName: "Medis",
        wasteTypeNameEn: "Medical",
        wasteGroupName: "Infeksius",
        wasteGroupNameEn: "Infectious",
        totalBags: 5,
        totalWeight: 12.5,
      },
    ]);

    const result = await service.getWasteGroupSummaryChart({ isBags: false, lang: "en" });
    expect(result.data).toEqual([{ labelType: "Medical", label: "Infectious", value: 12.5 }]);
    expect(result.total).toBe(12.5);
  });

  it("propagates repository errors unchanged as plain Errors (no APIError/flag — matches original's un-flagged throw -> 500)", async () => {
    mockedRepo.getWasteGroupSummaryChart.mockRejectedValue(new Error("db exploded"));
    await expect(service.getWasteGroupSummaryChart({})).rejects.toThrow("db exploded");
  });
});

describe("getWasteCharacteristicsSummaryChart", () => {
  it("happy path", async () => {
    mockedRepo.getWasteCharacteristicsSummaryChart.mockResolvedValue([
      { wasteTypeName: "Karakteristik A", wasteTypeNameEn: "Characteristic A", totalBags: 3, totalWeight: 7 },
    ]);
    const result = await service.getWasteCharacteristicsSummaryChart({ isBags: true });
    expect(result).toEqual([{ label: "Karakteristik A", value: 3 }]);
  });
});

describe("getMonthlyWasteBagSummaryChart", () => {
  it("happy path", async () => {
    mockedRepo.getMonthlyWasteBagSummaryChart.mockResolvedValue([
      { labelMonth: "01-2026", totalBags: 2, totalWeight: 4 },
    ]);
    const result = await service.getMonthlyWasteBagSummaryChart({ isBags: false });
    expect(result).toEqual([{ label: "01-2026", value: 4 }]);
  });
});

describe("getProvinceWasteBagSummaryChart", () => {
  it("happy path passes orderBy through to the repository", async () => {
    mockedRepo.getProvinceWasteBagSummaryChart.mockResolvedValue([
      { provinceName: "Jawa Barat", totalBags: 1, totalWeight: 2 },
    ]);
    const result = await service.getProvinceWasteBagSummaryChart({ isBags: true, orderBy: "DESC" });
    expect(result).toEqual([{ label: "Jawa Barat", value: 1 }]);
    expect(mockedRepo.getProvinceWasteBagSummaryChart).toHaveBeenCalledWith(
      expect.any(Object),
      true,
      "DESC",
    );
  });
});

describe("getRegencyWasteBagSummaryChart", () => {
  it("happy path", async () => {
    mockedRepo.getRegencyWasteBagSummaryChart.mockResolvedValue([
      { regencyName: "Bandung", totalBags: 4, totalWeight: 9 },
    ]);
    const result = await service.getRegencyWasteBagSummaryChart({ isBags: false });
    expect(result).toEqual([{ label: "Bandung", value: 9 }]);
  });
});

describe("getEntityWasteBagSummaryChart", () => {
  it("happy path builds pagination meta from repo total/limit/page", async () => {
    mockedRepo.getEntityWasteBagSummaryChart.mockResolvedValue({
      data: [
        {
          provinceName: "Jawa Barat",
          regencyName: "Bandung",
          healthcareFacilityName: "RS A",
          totalBags: 3,
          totalWeight: 6,
        },
      ],
      total: 21,
    });

    const result = await service.getEntityWasteBagSummaryChart({ isBags: true, limit: 10, page: 2 });
    expect(result.data).toEqual([
      { provinceName: "Jawa Barat", regencyName: "Bandung", healthcareFacilityName: "RS A", value: 3 },
    ]);
    expect(result.pagination).toEqual({ total: 21, pages: 3, currentPage: 2, perPage: 10 });
  });

  it("clamps limit to the 200 max and defaults page to 1 for invalid input, matching sanitizePaginationParams", async () => {
    mockedRepo.getEntityWasteBagSummaryChart.mockResolvedValue({ data: [], total: 0 });
    await service.getEntityWasteBagSummaryChart({ limit: 999, page: -5 });
    expect(mockedRepo.getEntityWasteBagSummaryChart).toHaveBeenCalledWith(
      expect.any(Object),
      200,
      1,
      undefined,
    );
  });
});

describe("getEntityWasteBagSummaryByGroup", () => {
  it("happy path", async () => {
    mockedRepo.getEntityWasteBagSummaryByGroup.mockResolvedValue({
      data: [
        {
          provinceName: "Jawa Barat",
          regencyName: "Bandung",
          healthcareFacilityName: "RS A",
          wasteGroupName: "Infeksius",
          wasteGroupNameEn: "Infectious",
          totalBags: 3,
          totalWeight: 6,
        },
      ],
      total: 1,
    });
    const result = await service.getEntityWasteBagSummaryByGroup({ isBags: true, lang: "en" });
    expect(result.data).toEqual([
      {
        provinceName: "Jawa Barat",
        regencyName: "Bandung",
        healthcareFacilityName: "RS A",
        wasteGroupName: "Infectious",
        value: 3,
      },
    ]);
  });
});

describe("getEntityWasteBagSummaryByCharacteristics", () => {
  it("happy path maps avg/max/gap fields based on isBags", async () => {
    mockedRepo.getEntityWasteBagSummaryByCharacteristics.mockResolvedValue({
      data: [
        {
          provinceName: "Jawa Barat",
          regencyName: "Bandung",
          healthcareFacilityName: "RS A",
          wasteFullName: "Medis - Infeksius - Padat",
          wasteFullNameEn: "Medical - Infectious - Solid",
          totalBagsCurrentMonth: "10",
          totalWeightCurrentMonth: "20",
          avgBagsPrev3Months: "5",
          avgWeightPrev3Months: "8",
          maxBagsPrev3Months: "7",
          maxWeightPrev3Months: "11",
          gapTimbulanBags: "3",
          gapTimbulanWeight: "9",
        },
      ],
      total: 1,
    });

    const result = await service.getEntityWasteBagSummaryByCharacteristics({ isBags: true, lang: "id" });
    expect(result.data).toEqual([
      {
        provinceName: "Jawa Barat",
        regencyName: "Bandung",
        healthcareFacilityName: "RS A",
        wasteFullName: "Medis - Infeksius - Padat",
        value: 10,
        avgValue: 5,
        maxValue: 7,
        gapValue: 3,
      },
    ]);
  });

  it("uses weight-based fields when isBags is false", async () => {
    mockedRepo.getEntityWasteBagSummaryByCharacteristics.mockResolvedValue({
      data: [
        {
          provinceName: null,
          regencyName: null,
          healthcareFacilityName: "RS A",
          wasteFullName: "Medis - Infeksius - Padat",
          wasteFullNameEn: "Medical - Infectious - Solid",
          totalBagsCurrentMonth: "10",
          totalWeightCurrentMonth: "20",
          avgBagsPrev3Months: "5",
          avgWeightPrev3Months: "8",
          maxBagsPrev3Months: "7",
          maxWeightPrev3Months: "11",
          gapTimbulanBags: "3",
          gapTimbulanWeight: "9",
        },
      ],
      total: 1,
    });

    const result = await service.getEntityWasteBagSummaryByCharacteristics({ isBags: false });
    expect(result.data[0]).toMatchObject({
      provinceName: undefined,
      regencyName: undefined,
      value: 20,
      avgValue: 8,
      maxValue: 11,
      gapValue: 9,
    });
  });
});

describe("getEntityWasteBagSummaryByCharacteristicsForExport", () => {
  it("defaults limit to 99999 and page to 1 when unset, matching the original export use-case's defaults", async () => {
    mockedRepo.getEntityWasteBagSummaryByCharacteristicsExport.mockResolvedValue([]);
    await service.getEntityWasteBagSummaryByCharacteristicsForExport({});
    expect(mockedRepo.getEntityWasteBagSummaryByCharacteristicsExport).toHaveBeenCalledWith(
      expect.any(Object),
      99999,
      1,
    );
  });

  it("propagates repository errors unchanged (no APIError — matches original's plain throw -> 500)", async () => {
    mockedRepo.getEntityWasteBagSummaryByCharacteristicsExport.mockRejectedValue(
      new Error("export failed"),
    );
    await expect(
      service.getEntityWasteBagSummaryByCharacteristicsForExport({}),
    ).rejects.toThrow("export failed");
  });
});
