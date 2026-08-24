import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./global-settings.repository", () => repoMock);

import * as service from "./global-settings.service";

describe("global-settings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getGlobalSettingsById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getGlobalSettingsById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getGlobalSettingsById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition (not NotFound) when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getGlobalSettingsById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "GlobalSettings not found",
      });
    });

    it("returns the entity on success", async () => {
      const entity = { id: 1, settingName: "theme", settingValue: "dark", createdBy: "u", createdAt: new Date() };
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getGlobalSettingsById("1")).resolves.toEqual(entity);
    });
  });

  describe("createGlobalSettings", () => {
    it("throws InvalidArgument (422-equivalent) on empty settingName", async () => {
      await expect(
        service.createGlobalSettings({ createdBy: "u", settingName: "", settingValue: "v" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates with updatedBy defaulted to createdBy", async () => {
      const entity = { id: 1, settingName: "a", settingValue: "b", createdBy: "u", createdAt: new Date() };
      repoMock.create.mockResolvedValue(entity);
      const result = await service.createGlobalSettings({ createdBy: "u", settingName: "a", settingValue: "b" });
      expect(result).toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith({ createdBy: "u", settingName: "a", settingValue: "b" });
    });
  });

  describe("updateGlobalSettings", () => {
    it("throws FailedPrecondition when id is missing/NaN (deviates from the original's string-return bug)", async () => {
      await expect(
        service.updateGlobalSettings({ id: "", updatedBy: "u" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.update.mockResolvedValue(null);
      await expect(
        service.updateGlobalSettings({ id: "1", updatedBy: "u" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("returns the updated entity on success", async () => {
      const entity = { id: 1, settingName: "a", settingValue: "b", createdBy: "u", createdAt: new Date() };
      repoMock.update.mockResolvedValue(entity);
      await expect(service.updateGlobalSettings({ id: "1", updatedBy: "u" })).resolves.toEqual(entity);
    });
  });

  describe("deleteGlobalSettings", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteGlobalSettings("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteGlobalSettings("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "data not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteGlobalSettings("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
