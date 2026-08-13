import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  create: vi.fn(),
  findAllPaginated: vi.fn(),
  hfAssetExists: vi.fn(),
}));
vi.mock("./healthcare-facility-asset-activity.repository", () => repoMock);

import * as service from "./healthcare-facility-asset-activity.service";

describe("healthcare-facility-asset-activity.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createHealthcareFacilityAssetActivity", () => {
    const validInput = {
      createdBy: "user-uuid",
      activityType: "MAINTENANCE",
      hfAssetId: 1,
      operatorId: "operator-uuid",
      createdAt: "2024-01-01",
      startDate: "2024-01-01",
    };

    it("throws InvalidArgument when activityType is not MAINTENANCE/CALIBRATION", async () => {
      await expect(
        service.createHealthcareFacilityAssetActivity({ ...validInput, activityType: "OTHER" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws InvalidArgument when hfAssetId is missing", async () => {
      await expect(
        service.createHealthcareFacilityAssetActivity({ ...validInput, hfAssetId: undefined as unknown as number })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws Internal (not NotFound) when the healthcare facility asset does not exist", async () => {
      repoMock.hfAssetExists.mockResolvedValue(false);
      await expect(service.createHealthcareFacilityAssetActivity(validInput)).rejects.toMatchObject({
        code: ErrCode.Internal,
        message: "Healthcare Facility Asset not found",
      });
    });

    it("creates and returns the entity on success", async () => {
      repoMock.hfAssetExists.mockResolvedValue(true);
      repoMock.create.mockResolvedValue(undefined);
      const result = await service.createHealthcareFacilityAssetActivity(validInput);
      expect(result).toMatchObject({
        createdBy: "user-uuid",
        activityType: "MAINTENANCE",
        hfAssetId: 1,
        operatorId: "operator-uuid",
      });
      expect(repoMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllHealthcareFacilityAssetActivity", () => {
    it("defaults limit=10 page=1 when not provided", async () => {
      repoMock.findAllPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllHealthcareFacilityAssetActivity({});
      expect(repoMock.findAllPaginated).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        activityType: undefined,
        hfAssetId: undefined,
      });
    });

    it("passes through activityType and hfAssetId filters", async () => {
      repoMock.findAllPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 2, perPage: 5 },
      });
      await service.getAllHealthcareFacilityAssetActivity({
        limit: 5,
        page: 2,
        activityType: "CALIBRATION",
        hfAssetId: 3,
      });
      expect(repoMock.findAllPaginated).toHaveBeenCalledWith({
        limit: 5,
        page: 2,
        activityType: "CALIBRATION",
        hfAssetId: 3,
      });
    });
  });
});

// Sanity check that APIError is the class thrown (not a plain object).
describe("error shape", () => {
  it("createHealthcareFacilityAssetActivity throws an APIError instance on validation failure", async () => {
    await expect(
      service.createHealthcareFacilityAssetActivity({
        createdBy: "u",
        activityType: "BAD",
        hfAssetId: 1,
        operatorId: "o",
        createdAt: "2024-01-01",
        startDate: "2024-01-01",
      })
    ).rejects.toBeInstanceOf(APIError);
  });
});
