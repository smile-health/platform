import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMocks = vi.hoisted(() => ({
  findById: vi.fn(),
  findByVehicleNumber: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  findExternalGroupUsage: vi.fn(),
}));

vi.mock("./partner-vehicle.repository", () => repoMocks);

import * as service from "./partner-vehicle.service";

const sample = {
  id: 1,
  createdAt: new Date("2024-01-01"),
  createdBy: "user-uuid",
  updatedAt: undefined,
  updatedBy: undefined,
  entityId: 5,
  vehicleType: "BOX_TRUCK" as const,
  vehicleNumber: "B1234XYZ",
  capacityInKgs: 500,
  transporterId: 10,
};

beforeEach(() => {
  vi.clearAllMocks();
  repoMocks.findExternalGroupUsage.mockResolvedValue(false);
});

describe("createPartnerVehicle", () => {
  it("throws InvalidArgument (422) on invalid body — matches validateRequest's isValidationError flag", async () => {
    await expect(
      service.createPartnerVehicle({
        createdBy: "user-uuid",
        vehicleType: "NOT_A_TYPE",
        vehicleNumber: "",
        capacityInKgs: -1,
        entityId: 5,
      } as any),
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    expect(repoMocks.create).not.toHaveBeenCalled();
  });

  it("creates the vehicle on the happy path", async () => {
    repoMocks.create.mockResolvedValue(sample);
    const result = await service.createPartnerVehicle({
      createdBy: "user-uuid",
      vehicleType: "BOX_TRUCK",
      vehicleNumber: "B1234XYZ",
      capacityInKgs: 500,
      entityId: 5,
      transporterId: 10,
    });
    expect(result).toEqual(sample);
    expect(repoMocks.create).toHaveBeenCalledWith({
      createdBy: "user-uuid",
      entityId: 5,
      vehicleType: "BOX_TRUCK",
      vehicleNumber: "B1234XYZ",
      capacityInKgs: 500,
      transporterId: 10,
    });
  });

  it("wraps a repository error (e.g. duplicate vehicleNumber) as Internal (500) — preserves the original's res.error() fallthrough, not a 4xx", async () => {
    repoMocks.create.mockRejectedValue(new Error("Vehicle creation failed: duplicate"));
    await expect(
      service.createPartnerVehicle({
        createdBy: "user-uuid",
        vehicleType: "BOX_TRUCK",
        vehicleNumber: "B1234XYZ",
        capacityInKgs: 500,
        entityId: 5,
      }),
    ).rejects.toMatchObject({ code: ErrCode.Internal });
  });
});

describe("createMultipleHealthcarePartnerVehicle", () => {
  it("throws InvalidArgument (422) on invalid body", async () => {
    await expect(
      service.createMultipleHealthcarePartnerVehicle({
        createdBy: "user-uuid",
        vehicleType: "BOX_TRUCK",
        vehicleNumber: "",
        capacityInKgs: 500,
        entityIds: "",
      } as any),
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
  });

  it("throws Internal (500) when entityIds parses to nothing usable", async () => {
    await expect(
      service.createMultipleHealthcarePartnerVehicle({
        createdBy: "user-uuid",
        vehicleType: "BOX_TRUCK",
        vehicleNumber: "B1234XYZ",
        capacityInKgs: 500,
        entityIds: "abc,def",
      }),
    ).rejects.toMatchObject({ code: ErrCode.Internal, message: "Invalid entityIds format" });
    expect(repoMocks.createMany).not.toHaveBeenCalled();
  });

  it("creates rows for every parsed entityId on the happy path", async () => {
    repoMocks.createMany.mockResolvedValue(undefined);
    const result = await service.createMultipleHealthcarePartnerVehicle({
      createdBy: "user-uuid",
      vehicleType: "VAN",
      vehicleNumber: "B5678AAA",
      capacityInKgs: 300,
      entityIds: "1, 2, 3",
      transporterId: 10,
    });

    expect(repoMocks.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ entityId: 1 }),
      expect.objectContaining({ entityId: 2 }),
      expect.objectContaining({ entityId: 3 }),
    ]);
    // preserves the original's `delete (assetModel as any).entityId` bug
    expect((result as any).entityId).toBeUndefined();
  });
});

describe("getPartnerVehicleById", () => {
  it("throws FailedPrecondition (400) when id is empty", async () => {
    await expect(service.getPartnerVehicleById("")).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "ID parameter is required",
    });
  });

  it("throws FailedPrecondition (400, not 404) when not found", async () => {
    repoMocks.findById.mockResolvedValue(null);
    await expect(service.getPartnerVehicleById("999")).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "Waste source not found",
    });
  });

  it("returns the vehicle on the happy path", async () => {
    repoMocks.findById.mockResolvedValue(sample);
    const result = await service.getPartnerVehicleById("1");
    expect(result).toEqual(sample);
  });
});

describe("getAllPartnerVehicles", () => {
  it("throws InvalidArgument (422) when transporterId is missing — matches isValidationError flag", async () => {
    await expect(
      service.getAllPartnerVehicles({ transporterId: 0 }),
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument, message: "Unauthorized: Missing entity ID" });
  });

  it("sanitizes limit/page and filters by transporter_id when entityTag isn't hospital-like", async () => {
    repoMocks.findPaginated.mockResolvedValue({
      data: [sample],
      pagination: { total: 1, pages: 1, currentPage: 1, perPage: 10 },
    });

    await service.getAllPartnerVehicles({ transporterId: 10, entityTag: "transporter", limit: -5, page: 0 });

    expect(repoMocks.findPaginated).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      search: undefined,
      entityIdFilter: undefined,
      transporterIdFilter: 10,
      healthcareFacilityId: undefined,
      providerId: undefined,
    });
  });

  it("remaps allowed hospital-adjacent entity types to 'hospital' and filters by entity_id", async () => {
    repoMocks.findPaginated.mockResolvedValue({
      data: [],
      pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
    });

    await service.getAllPartnerVehicles({ transporterId: 10, entityTag: "healthcare_facility" });

    expect(repoMocks.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ entityIdFilter: 10, transporterIdFilter: undefined }),
    );
  });

  it("caps limit at 1000", async () => {
    repoMocks.findPaginated.mockResolvedValue({
      data: [],
      pagination: { total: 0, pages: 0, currentPage: 1, perPage: 1000 },
    });
    await service.getAllPartnerVehicles({ transporterId: 10, limit: 5000 });
    expect(repoMocks.findPaginated).toHaveBeenCalledWith(expect.objectContaining({ limit: 1000 }));
  });
});

describe("updatePartnerVehicle", () => {
  it("throws FailedPrecondition (400) when id is empty", async () => {
    await expect(
      service.updatePartnerVehicle({
        id: "",
        updatedBy: "user-uuid",
        vehicleType: "BOX_TRUCK",
        vehicleNumber: "B1234XYZ",
        capacityInKgs: 500,
        entityId: 5,
      }),
    ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "ID parameter is required" });
  });

  it("throws InvalidArgument (422) on invalid body", async () => {
    await expect(
      service.updatePartnerVehicle({
        id: "1",
        updatedBy: "user-uuid",
        vehicleType: "NOT_A_TYPE",
        vehicleNumber: "B1234XYZ",
        capacityInKgs: 500,
        entityId: 5,
      } as any),
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
  });

  it("throws FailedPrecondition (400) when not found", async () => {
    repoMocks.findById.mockResolvedValue(null);
    await expect(
      service.updatePartnerVehicle({
        id: "42",
        updatedBy: "user-uuid",
        vehicleType: "BOX_TRUCK",
        vehicleNumber: "B1234XYZ",
        capacityInKgs: 500,
        entityId: 5,
      }),
    ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Waste source not found" });
    expect(repoMocks.update).not.toHaveBeenCalled();
  });

  it("updates and returns the vehicle on the happy path", async () => {
    repoMocks.findById.mockResolvedValue(sample);
    repoMocks.update.mockResolvedValue({ ...sample, vehicleNumber: "B9999ZZZ" });

    const result = await service.updatePartnerVehicle({
      id: "1",
      updatedBy: "updater-uuid",
      vehicleType: "BOX_TRUCK",
      vehicleNumber: "B9999ZZZ",
      capacityInKgs: 500,
      entityId: 5,
    });

    expect(repoMocks.update).toHaveBeenCalledWith(1, {
      updatedBy: "updater-uuid",
      entityId: 5,
      vehicleType: "BOX_TRUCK",
      vehicleNumber: "B9999ZZZ",
      capacityInKgs: 500,
    });
    expect(result.vehicleNumber).toBe("B9999ZZZ");
  });

  it("wraps a repository error as Internal (500)", async () => {
    repoMocks.findById.mockResolvedValue(sample);
    repoMocks.update.mockRejectedValue(new Error("boom"));
    await expect(
      service.updatePartnerVehicle({
        id: "1",
        updatedBy: "user-uuid",
        vehicleType: "BOX_TRUCK",
        vehicleNumber: "B1234XYZ",
        capacityInKgs: 500,
        entityId: 5,
      }),
    ).rejects.toMatchObject({ code: ErrCode.Internal });
  });
});

describe("deletePartnerVehicle", () => {
  it("throws FailedPrecondition (400) when id is empty", async () => {
    await expect(service.deletePartnerVehicle({ id: "" })).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "ID parameter is required",
    });
  });

  it("throws FailedPrecondition (400) when not found", async () => {
    repoMocks.findById.mockResolvedValue(null);
    await expect(service.deletePartnerVehicle({ id: "42" })).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "Partner Vehicle with ID 42 not deleted",
    });
  });

  it("throws FailedPrecondition (400) when in use by a waste transportation group", async () => {
    repoMocks.findById.mockResolvedValue(sample);
    repoMocks.findExternalGroupUsage.mockResolvedValue(true);
    await expect(service.deletePartnerVehicle({ id: "1" })).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
    });
    expect(repoMocks.softDelete).not.toHaveBeenCalled();
  });

  it("deletes and returns true on the happy path", async () => {
    repoMocks.findById.mockResolvedValue(sample);
    repoMocks.softDelete.mockResolvedValue(true);
    const result = await service.deletePartnerVehicle({ id: "1", deletedBy: 99 });
    expect(result).toBe(true);
    expect(repoMocks.softDelete).toHaveBeenCalledWith(1, 99);
  });
});
