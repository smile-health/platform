import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findByName: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./asset-manufacturer.repository", () => repoMock);

import * as service from "./asset-manufacturer.service";

describe("asset-manufacturer.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAssetManufacturerById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getAssetManufacturerById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getAssetManufacturerById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getAssetManufacturerById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Asset manufacturer not found",
      });
    });

    it("returns the entity on success", async () => {
      const entity = { id: 1, name: "Acme", createdBy: "u", updatedBy: "u", createdAt: new Date(), updatedAt: new Date() };
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getAssetManufacturerById("1")).resolves.toEqual(entity);
    });
  });

  describe("createAssetManufacturer", () => {
    it("throws InvalidArgument (422-equivalent) on empty name", async () => {
      await expect(
        service.createAssetManufacturer({ createdBy: "u", name: "" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws Internal (500, preserved from the original's res.error path) when name already exists", async () => {
      repoMock.findByName.mockResolvedValue({ id: 1, name: "Acme" });
      await expect(
        service.createAssetManufacturer({ createdBy: "u", name: "Acme" })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("creates when name is unique", async () => {
      repoMock.findByName.mockResolvedValue(null);
      const entity = { id: 1, name: "Acme", createdBy: "u", updatedBy: "u", createdAt: new Date(), updatedAt: new Date() };
      repoMock.create.mockResolvedValue(entity);
      const result = await service.createAssetManufacturer({ createdBy: "u", name: "Acme" });
      expect(result).toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith({ createdBy: "u", name: "Acme", description: undefined });
    });
  });

  describe("updateAssetManufacturer", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(
        service.updateAssetManufacturer({ id: "", updatedBy: "u", name: "Acme" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "ID parameter is required" });
    });

    it("throws InvalidArgument when name is missing", async () => {
      await expect(
        service.updateAssetManufacturer({ id: "1", updatedBy: "u", name: "" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition (typo 'Aset' preserved) when the row does not exist", async () => {
      repoMock.update.mockResolvedValue(null);
      await expect(
        service.updateAssetManufacturer({ id: "1", updatedBy: "u", name: "Acme" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Aset Manufacturer not found" });
    });

    it("returns the updated entity on success", async () => {
      const entity = { id: 1, name: "Acme", createdBy: "u", updatedBy: "u", createdAt: new Date(), updatedAt: new Date() };
      repoMock.update.mockResolvedValue(entity);
      await expect(
        service.updateAssetManufacturer({ id: "1", updatedBy: "u", name: "Acme" })
      ).resolves.toEqual(entity);
    });
  });

  describe("deleteAssetManufacturer", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteAssetManufacturer("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("ALWAYS throws FailedPrecondition, even on a successful delete — preserved bug from the original (Sequelize's destroy() resolves undefined, which the original controller's `!data` check misreads as not-found)", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteAssetManufacturer("1", 42)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Aset Manufacturer not found",
      });
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
