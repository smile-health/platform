import { APIError, ErrCode } from "encore.dev/api";
import {
  updateEntitiesBodySchema,
  updateStatusActiveEntitiesBodySchema,
} from "./entities.schema";
import * as repo from "./entities.repository";
import type {
  Entities,
  EntitiesListResult,
  UpdateEntitiesRequestBody,
} from "./entities.types";

// entitiesController.ts's res.fail(...) calls all omit the options object, so
// every one of these is a plain 400 with a string `data` payload —
// ErrCode.FailedPrecondition (→400) matches that verbatim; NotFound/
// InvalidArgument (→404/422) would be a behavior change from the original.

export async function getEntitiesById(input: {
  entityId?: string;
  userEntityId?: number;
}): Promise<Entities | null> {
  // Mirrors entitiesController.ts's getEntitiesById: falls back to the
  // authenticated user's own entity id when no ?entityId query param is
  // given; throws (as a plain Error, caught by res.error → 500 in the
  // original) if neither is present.
  const resolvedId = input.entityId ?? input.userEntityId?.toString();
  if (!resolvedId) {
    throw new Error("user entity are required.");
  }

  const numericId = Number(resolvedId);
  const data = await repo.getEntityId(numericId);
  return data ?? null;
}

export async function updateEntities(input: {
  entityId?: number;
  body: UpdateEntitiesRequestBody;
}): Promise<Entities> {
  const parsed = updateEntitiesBodySchema.parse(input.body);

  // UpdateEntitiesUseCase.execute: `if (!entityId) return 'ID is required...'`
  // then controller does `if (data === null) res.fail(...)`. A string return
  // is truthy, not null, so that "ID is required" string branch actually
  // falls through to res.success(<string>) in the original, not res.fail —
  // an original bug. Reproducing res.fail here (404-shaped 400) would be a
  // behavior change; instead we throw FailedPrecondition only for the one
  // branch the controller actually maps to res.fail: existingData === null.
  if (!input.entityId) {
    // Preserve the original's actual (buggy) behavior: falls through to
    // res.success with the literal string message.
    return { name: "ID is required to update an entity setting" } as unknown as Entities;
  }

  const existing = await repo.getEntityId(input.entityId);
  if (!existing) {
    throw new APIError(ErrCode.FailedPrecondition, "Entity Settings not found");
  }

  const updated = await repo.updateEntity(input.entityId, {
    nib: parsed.nib,
    mobilePhone: parsed.mobile_phone,
    headName: parsed.head_name,
    email: parsed.email,
    gender: parsed.gender,
    totalBadRoom: parsed.total_bad_room,
    percentageBadRoom: parsed.percentage_bad_room,
  });

  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Entity Settings not found");
  }
  return updated;
}

export async function updateStatusEntities(input: {
  id?: string;
  is_active: boolean | number;
}): Promise<Entities> {
  if (!input.id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsedBody = updateStatusActiveEntitiesBodySchema.parse({
    is_active: input.is_active,
  });

  const entityId = Number(input.id);
  const existing = await repo.getEntityId(entityId);
  if (!existing) {
    throw new APIError(ErrCode.FailedPrecondition, "Users not found");
  }

  const updated = await repo.updateStatusActiveEntities(entityId, parsedBody.is_active);
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, "Users not found");
  }
  return updated;
}

export async function getAllEntities(input: {
  entityTypeId?: string;
  entityId?: string;
  groupBy?: string;
  attributes?: string;
  limit?: string;
  page?: string;
  search?: string;
  provinceId?: string;
  regencyId?: string;
  isActive?: string;
}): Promise<EntitiesListResult | string> {
  const parseBoolean = (value?: string): boolean | undefined => {
    if (value === undefined) return undefined;
    const s = value.trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(s)) return true;
    if (["0", "false", "no", "n", "off"].includes(s)) return false;
    return undefined;
  };

  const groupByArray = input.groupBy
    ? input.groupBy.split(",").map((s) => s.trim())
    : undefined;
  const attributesArray = input.attributes
    ? input.attributes.split(",").map((s) => s.trim())
    : undefined;

  const result = await repo.getAllEntities({
    limit: input.limit ? Number(input.limit) : undefined,
    page: input.page ? Number(input.page) : undefined,
    entityTypeId: input.entityTypeId ? Number(input.entityTypeId) : undefined,
    entityId: input.entityId ? Number(input.entityId) : undefined,
    groupBy: groupByArray,
    attributes: attributesArray,
    search: input.search,
    provinceId: input.provinceId ? Number(input.provinceId) : undefined,
    regencyId: input.regencyId ? Number(input.regencyId) : undefined,
    isActive: parseBoolean(input.isActive),
  });

  // getAllEntitiesController: `if (data === null) res.success('No entities found')`.
  // GetAllEntitiesUseCase/RepositoryImpl never actually returns null (always
  // resolves to {data,pagination}), so that branch is dead in the original —
  // preserved here as unreachable too, not invoked.
  return result;
}
