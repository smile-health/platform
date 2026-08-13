import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMocks = vi.hoisted(() => ({
  checkDuplication: vi.fn(),
  createEntitySettings: vi.fn(),
  findEntitySettingsById: vi.fn(),
  findAllEntitySettings: vi.fn(),
  updateEntitySettings: vi.fn(),
  deleteEntitySettings: vi.fn(),
}));

vi.mock("./entity-settings.repository", () => repoMocks);

import * as service from "./entity-settings.service";

const sample = {
  id: 1,
  entityId: 5,
  settingName: "MAX_CAPACITY",
  settingValue: "100",
  createdBy: "user-uuid",
  updatedBy: undefined,
  createdAt: new Date("2024-01-01"),
  updatedAt: undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getEntitySettingsById", () => {
  it("throws FailedPrecondition (400) when id is empty", async () => {
    await expect(service.getEntitySettingsById("")).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
    });
  });

  it("throws FailedPrecondition (400, not 404) when not found", async () => {
    repoMocks.findEntitySettingsById.mockResolvedValue(null);
    await expect(service.getEntitySettingsById("999")).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "EntitySettings not found",
    });
  });

  it("returns the entity on the happy path", async () => {
    repoMocks.findEntitySettingsById.mockResolvedValue(sample);
    const result = await service.getEntitySettingsById("1");
    expect(result).toEqual(sample);
    expect(repoMocks.findEntitySettingsById).toHaveBeenCalledWith(1);
  });
});

describe("getAllEntitySettings", () => {
  it("sanitizes limit/page and delegates to the repository", async () => {
    repoMocks.findAllEntitySettings.mockResolvedValue({
      data: [sample],
      pagination: { total: 1, pages: 1, currentPage: 1, perPage: 10 },
    });

    const result = await service.getAllEntitySettings({ limit: "abc", page: "0", entityId: "5" });

    expect(repoMocks.findAllEntitySettings).toHaveBeenCalledWith(10, 1, undefined, "5");
    expect(result.data).toEqual([sample]);
  });

  it("caps limit at 1000 and honors valid page", async () => {
    repoMocks.findAllEntitySettings.mockResolvedValue({
      data: [],
      pagination: { total: 0, pages: 0, currentPage: 3, perPage: 1000 },
    });

    await service.getAllEntitySettings({ limit: "5000", page: "3" });

    expect(repoMocks.findAllEntitySettings).toHaveBeenCalledWith(1000, 3, undefined, undefined);
  });
});

describe("createEntitySettings", () => {
  it("throws InvalidArgument (422) on duplicate setting — matches isValidationError flag", async () => {
    repoMocks.checkDuplication.mockResolvedValue(false);

    await expect(
      service.createEntitySettings({
        entityId: 5,
        settingName: "DUP",
        settingValue: "1",
        createdBy: "user-uuid",
      })
    ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });

    expect(repoMocks.createEntitySettings).not.toHaveBeenCalled();
  });

  it("throws FailedPrecondition (400) on empty settingName (semantic validation)", async () => {
    await expect(
      service.createEntitySettings({
        entityId: 5,
        settingName: "",
        settingValue: "1",
        createdBy: "user-uuid",
      })
    ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
  });

  it("creates the setting on the happy path, defaulting entityId to 0 when absent", async () => {
    repoMocks.checkDuplication.mockResolvedValue(true);
    repoMocks.createEntitySettings.mockResolvedValue(sample);

    const result = await service.createEntitySettings({
      settingName: "MAX_CAPACITY",
      settingValue: "100",
      createdBy: "user-uuid",
    });

    expect(repoMocks.checkDuplication).toHaveBeenCalledWith(0, "MAX_CAPACITY", "100");
    expect(result).toEqual(sample);
  });
});

describe("updateEntitySettings", () => {
  it("throws FailedPrecondition (400) when id is empty", async () => {
    await expect(
      service.updateEntitySettings({ id: "", updatedBy: "user-uuid" })
    ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
  });

  it("returns a not-found STRING (not a thrown error) when the row is missing — preserves the original bug", async () => {
    repoMocks.findEntitySettingsById.mockResolvedValue(null);

    const result = await service.updateEntitySettings({ id: "42", updatedBy: "user-uuid" });

    expect(typeof result).toBe("string");
    expect(result).toBe("Entity setting with ID 42 not found");
    expect(repoMocks.updateEntitySettings).not.toHaveBeenCalled();
  });

  it("updates and returns the merged entity on the happy path", async () => {
    repoMocks.findEntitySettingsById.mockResolvedValue(sample);
    repoMocks.updateEntitySettings.mockResolvedValue(undefined);

    const result = await service.updateEntitySettings({
      id: "1",
      settingValue: "200",
      updatedBy: "updater-uuid",
    });

    expect(repoMocks.updateEntitySettings).toHaveBeenCalledWith({
      id: 1,
      entityId: sample.entityId,
      settingName: sample.settingName,
      settingValue: "200",
      updatedBy: "updater-uuid",
    });
    expect(result).toMatchObject({ settingValue: "200", updatedBy: "updater-uuid" });
  });
});

describe("deleteEntitySettings", () => {
  it("throws FailedPrecondition (400) when not found", async () => {
    repoMocks.findEntitySettingsById.mockResolvedValue(null);
    await expect(service.deleteEntitySettings("42")).rejects.toMatchObject({
      code: ErrCode.FailedPrecondition,
      message: "data not found",
    });
  });

  it("deletes and returns true on the happy path", async () => {
    repoMocks.findEntitySettingsById.mockResolvedValue(sample);
    repoMocks.deleteEntitySettings.mockResolvedValue(true);

    const result = await service.deleteEntitySettings("1");
    expect(result).toBe(true);
  });
});
