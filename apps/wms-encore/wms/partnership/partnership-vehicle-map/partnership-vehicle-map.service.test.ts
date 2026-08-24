import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrCode } from "encore.dev/api";

const repoMocks = vi.hoisted(() => ({
  create: vi.fn(),
  findAllPaginated: vi.fn(),
  existsPartnership: vi.fn(),
  softDelete: vi.fn(),
}));

vi.mock("./partnership-vehicle-map.repository", () => repoMocks);

import * as service from "./partnership-vehicle-map.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createPartnershipVehicleMap", () => {
  it("throws InvalidArgument (422) when partnershipId is missing/invalid", async () => {
    await expect(
      service.createPartnershipVehicleMap({ partnershipId: 0, vehicleId: 1 } as any),
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    expect(repoMocks.existsPartnership).not.toHaveBeenCalled();
  });

  it("throws InvalidArgument (422) when vehicleId is missing/invalid", async () => {
    await expect(
      service.createPartnershipVehicleMap({ partnershipId: 1, vehicleId: -1 } as any),
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
  });

  it("throws InvalidArgument (422) with the original's exact message when the partnership doesn't exist", async () => {
    repoMocks.existsPartnership.mockResolvedValue(false);
    await expect(
      service.createPartnershipVehicleMap({ partnershipId: 42, vehicleId: 1 }),
    ).rejects.toMatchObject({
      code: ErrCode.InvalidArgument,
      message: "No asset partnership for ID 42",
    });
    expect(repoMocks.create).not.toHaveBeenCalled();
  });

  it("creates the map and returns it on the happy path", async () => {
    repoMocks.existsPartnership.mockResolvedValue(true);
    repoMocks.create.mockResolvedValue(undefined);
    const result = await service.createPartnershipVehicleMap({ partnershipId: 1, vehicleId: 2 });
    expect(result).toEqual({ partnershipId: 1, vehicleId: 2 });
    expect(repoMocks.create).toHaveBeenCalledWith(1, 2);
  });
});

describe("getAllPartnershipVehicleMaps", () => {
  it("defaults limit/page to 10/1 when absent and falls back to authEntityId as search", async () => {
    repoMocks.findAllPaginated.mockResolvedValue({
      data: [],
      pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
    });
    await service.getAllPartnershipVehicleMaps({ authEntityId: "7" });
    expect(repoMocks.findAllPaginated).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      search: "7",
    });
  });

  it("prefers the explicit search query param over authEntityId", async () => {
    repoMocks.findAllPaginated.mockResolvedValue({
      data: [],
      pagination: { total: 0, pages: 0, currentPage: 1, perPage: 5 },
    });
    await service.getAllPartnershipVehicleMaps({
      limit: 5,
      page: 2,
      search: "search-term",
      authEntityId: "7",
    });
    expect(repoMocks.findAllPaginated).toHaveBeenCalledWith({
      limit: 5,
      page: 2,
      search: "search-term",
    });
  });
});

describe("deletePartnershipVehicleMap", () => {
  it("throws FailedPrecondition (400) when partnershipId is missing", async () => {
    await expect(
      service.deletePartnershipVehicleMap({ vehicleId: "1", deletedBy: "9" }),
    ).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "partnership_id and vehicle_id parameter is required",
    });
    expect(repoMocks.softDelete).not.toHaveBeenCalled();
  });

  it("throws FailedPrecondition (400) when vehicleId is missing", async () => {
    await expect(
      service.deletePartnershipVehicleMap({ partnershipId: "1", deletedBy: "9" }),
    ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
  });

  it("throws FailedPrecondition (400) with the original's exact message when not found", async () => {
    repoMocks.softDelete.mockResolvedValue(false);
    await expect(
      service.deletePartnershipVehicleMap({ partnershipId: "1", vehicleId: "2", deletedBy: "9" }),
    ).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "Partnership vehicle map not found",
    });
  });

  it("deletes and returns true on the happy path, passing numeric deletedBy through", async () => {
    repoMocks.softDelete.mockResolvedValue(true);
    const result = await service.deletePartnershipVehicleMap({
      partnershipId: "1",
      vehicleId: "2",
      deletedBy: "9",
    });
    expect(result).toBe(true);
    expect(repoMocks.softDelete).toHaveBeenCalledWith(1, 2, 9);
  });

  it("omits deletedBy when not provided", async () => {
    repoMocks.softDelete.mockResolvedValue(true);
    await service.deletePartnershipVehicleMap({ partnershipId: "1", vehicleId: "2" });
    expect(repoMocks.softDelete).toHaveBeenCalledWith(1, 2, undefined);
  });
});
