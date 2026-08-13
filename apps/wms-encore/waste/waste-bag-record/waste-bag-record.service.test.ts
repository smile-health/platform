import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findAllFiltered: vi.fn(),
  create: vi.fn(),
  findRecordCharacteristicsSummary: vi.fn(),
}));
vi.mock("./waste-bag-record.repository", () => repoMock);

const wasteClassificationRepoMock = vi.hoisted(() => ({
  findById: vi.fn(),
}));
vi.mock("../waste-classification/waste-classification.repository", () => wasteClassificationRepoMock);

import * as service from "./waste-bag-record.service";

describe("waste-bag-record.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWasteBagRecord", () => {
    const validInput = {
      createdBy: "user-uuid",
      healthcareFacilityId: 1,
      wasteSourceId: 2,
      wasteClassificationId: 3,
      scaleMethod: "MANUAL",
      weightInKgs: 1.5,
      wasteBagQrCodeId: "QR-1",
    };

    it("throws InvalidArgument (422) on invalid body", async () => {
      await expect(
        service.createWasteBagRecord({ ...validInput, wasteBagQrCodeId: "" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition when waste classification is not found (mirrors WASTE_CLASSIFICATION_NOT_FOUND string branch)", async () => {
      wasteClassificationRepoMock.findById.mockResolvedValue(null);
      await expect(service.createWasteBagRecord(validInput)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "WASTE_CLASSIFICATION_NOT_FOUND",
      });
    });

    it("creates with IN_TEMPORARY_STORAGE status and HEALTHCARE_FACILITY ownership", async () => {
      wasteClassificationRepoMock.findById.mockResolvedValue({ id: 3, tempStorageMaxHours: 24 });
      const created = { id: 10, ...validInput, wasteStatus: "IN_TEMPORARY_STORAGE" };
      repoMock.create.mockResolvedValue(created);

      const result = await service.createWasteBagRecord(validInput);

      expect(result).toEqual(created);
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownedBy: "HEALTHCARE_FACILITY",
          isDisposed: false,
          wasteClassificationId: 3,
        })
      );
    });
  });

  describe("getAllWasteBagRecord", () => {
    it("throws Internal (mirrors the original's plain 500 'Authorization error') when entityTag is missing", async () => {
      await expect(service.getAllWasteBagRecord({})).rejects.toMatchObject({
        code: ErrCode.Internal,
      });
    });

    it("throws FailedPrecondition on malformed wasteClassificationId JSON", async () => {
      await expect(
        service.getAllWasteBagRecord({ entityTag: "hospital", wasteClassificationId: "not-json" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("groups rows by created date and sums weight/count", async () => {
      repoMock.findAllFiltered.mockResolvedValue([
        {
          wasteBagQrCodeId: "QR-1",
          weightInKgs: 1.5,
          createdAt: new Date("2024-01-01T00:00:00Z"),
        },
        {
          wasteBagQrCodeId: "QR-2",
          weightInKgs: 2.5,
          createdAt: new Date("2024-01-01T05:00:00Z"),
        },
      ]);

      const result = await service.getAllWasteBagRecord({ entityTag: "hospital", entityId: 1 });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ date: "2024-01-01", totalBags: 2, totalWeight: 4 });
    });
  });

  describe("exportWasteRecordCharacteristicsSummary", () => {
    it("throws a plain Error (mirrors the original's 500-mapped guard) when startDate/endDate are missing", async () => {
      await expect(
        service.exportWasteRecordCharacteristicsSummary({})
      ).rejects.toThrow("startDate and endDate are required.");
    });

    it("builds an .xlsx buffer from the summary rows", async () => {
      repoMock.findRecordCharacteristicsSummary.mockResolvedValue([
        {
          wasteTypeName: "Infeksius",
          wasteGroupName: "Medis",
          wasteCharacteristicsName: "Sitotoksik",
          totalWasteBag: 5,
          totalWeightInKgs: 12.3,
          avgWeightPerDay: 1.2,
          avgWasteBagPerDay: 1,
          healthcareFacilityName: "RS A",
        },
      ]);

      const result = await service.exportWasteRecordCharacteristicsSummary({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.filename).toMatch(/^waste_characteristics_2024-01-01_2024-01-31_.*\.xlsx$/);
    });
  });
});
