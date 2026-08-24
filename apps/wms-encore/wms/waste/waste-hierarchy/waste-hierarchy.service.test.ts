import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findByParentHierarchyId: vi.fn(),
  findByParentHierarchyIdNull: vi.fn(),
  findPaginated: vi.fn(),
  findByNameAndParent: vi.fn(),
  findByNameAndLevelExcludingId: vi.fn(),
  hasChildren: vi.fn(),
  isReferencedByWasteClassification: vi.fn(),
  findOneRegion: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deactivate: vi.fn(),
  findExplanationOfWasteClassification: vi.fn(),
}));
vi.mock("./waste-hierarchy.repository", () => repoMock);

import * as service from "./waste-hierarchy.service";

const baseEntity = {
  id: 1,
  createdAt: new Date(),
  createdBy: "u",
  regionId: 1,
  name: "Sharp",
  nameEn: "Sharp",
  level: 0,
  isActive: true,
};

describe("waste-hierarchy.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWasteHierarchyById", () => {
    it("throws FailedPrecondition when id is not numeric", async () => {
      await expect(service.getWasteHierarchyById("abc")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition (not NotFound) when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getWasteHierarchyById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste hierarchy not found",
      });
    });

    it("returns the entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      await expect(service.getWasteHierarchyById("1")).resolves.toEqual(baseEntity);
    });
  });

  describe("getWasteHierarchyByParentHierarchyId", () => {
    it("throws FailedPrecondition when parentHierarchyId is missing", async () => {
      await expect(service.getWasteHierarchyByParentHierarchyId(undefined)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "parent_hierarchy_id parameter is required",
      });
    });

    it("uses findByParentHierarchyIdNull for the literal 'null' sentinel", async () => {
      repoMock.findByParentHierarchyIdNull.mockResolvedValue([baseEntity]);
      await expect(service.getWasteHierarchyByParentHierarchyId("null")).resolves.toEqual([baseEntity]);
      expect(repoMock.findByParentHierarchyIdNull).toHaveBeenCalled();
      expect(repoMock.findByParentHierarchyId).not.toHaveBeenCalled();
    });

    it("throws FailedPrecondition when nothing is found", async () => {
      repoMock.findByParentHierarchyId.mockResolvedValue([]);
      await expect(service.getWasteHierarchyByParentHierarchyId("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste hierarchy not found",
      });
    });
  });

  describe("createWasteHierarchy", () => {
    it("throws InvalidArgument on invalid body shape", async () => {
      await expect(
        service.createWasteHierarchy({ createdBy: "u", name: "", nameEn: "", description: "" } as any)
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws Internal when no region exists and no regionId supplied", async () => {
      repoMock.findOneRegion.mockResolvedValue(null);
      repoMock.findByNameAndParent.mockResolvedValue(null);
      await expect(
        service.createWasteHierarchy({ createdBy: "u", name: "A", nameEn: "A", description: "d" })
      ).rejects.toMatchObject({ code: ErrCode.Internal, message: "Region not found" });
    });

    it("throws Internal when a duplicate name exists", async () => {
      repoMock.findOneRegion.mockResolvedValue({ id: 1 });
      repoMock.findByNameAndParent.mockResolvedValue(baseEntity);
      await expect(
        service.createWasteHierarchy({ createdBy: "u", name: "Sharp", nameEn: "Sharp", description: "d" })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("creates successfully with a default region when none supplied", async () => {
      repoMock.findOneRegion.mockResolvedValue({ id: 7 });
      repoMock.findByNameAndParent.mockResolvedValue(null);
      repoMock.create.mockResolvedValue(baseEntity);
      const result = await service.createWasteHierarchy({
        createdBy: "u",
        name: "Sharp",
        nameEn: "Sharp",
        description: "d",
      });
      expect(result).toEqual(baseEntity);
      expect(repoMock.create).toHaveBeenCalledWith(expect.objectContaining({ regionId: 7 }));
    });
  });

  describe("updateWasteHierarchy", () => {
    it("throws Internal when id is not numeric (preserved upstream bug)", async () => {
      await expect(
        service.updateWasteHierarchy({ id: "abc", updatedBy: "u", name: "A", nameEn: "A" })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.updateWasteHierarchy({ id: "1", updatedBy: "u", name: "A", nameEn: "A" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("returns the updated entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      repoMock.findByNameAndLevelExcludingId.mockResolvedValue(null);
      repoMock.update.mockResolvedValue({ ...baseEntity, name: "New" });
      const result = await service.updateWasteHierarchy({
        id: "1",
        updatedBy: "u",
        name: "New",
        nameEn: "New",
      });
      expect(result.name).toBe("New");
    });
  });

  describe("deleteWasteHierarchy", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteWasteHierarchy("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition (ALREADY_EXIST_IN_HIERARCHY) when children exist", async () => {
      repoMock.hasChildren.mockResolvedValue(true);
      await expect(service.deleteWasteHierarchy("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "ALREADY_EXIST_IN_HIERARCHY",
      });
    });

    it("throws FailedPrecondition (ALREADY_EXIST_IN_CLASSIFICATION) when referenced by waste_classification", async () => {
      repoMock.hasChildren.mockResolvedValue(false);
      repoMock.isReferencedByWasteClassification.mockResolvedValue(true);
      await expect(service.deleteWasteHierarchy("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "ALREADY_EXIST_IN_CLASSIFICATION",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.hasChildren.mockResolvedValue(false);
      repoMock.isReferencedByWasteClassification.mockResolvedValue(false);
      repoMock.deactivate.mockResolvedValue(true);
      await expect(service.deleteWasteHierarchy("1")).resolves.toBe(true);
    });
  });

  describe("explanationOfWasteClassification", () => {
    it("returns the repository rows as-is", async () => {
      repoMock.findExplanationOfWasteClassification.mockResolvedValue([]);
      await expect(service.explanationOfWasteClassification()).resolves.toEqual([]);
    });
  });
});

void APIError;
