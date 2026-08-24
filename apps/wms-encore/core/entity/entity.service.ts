// Business/orchestration layer — same shape as core/material/material.service.ts.
import * as repo from "./entity.repository";
import { validateEntityRequest } from "./entity.validation";
import { EntityRequestSchema, type EntityRequest } from "./entity.schema";
import type { EntityRow } from "./entity.repository";

export class EntityNotFoundError extends Error {
  constructor(id: number) {
    super(`Entity ${id} not found`);
  }
}

export interface EntityDetail extends EntityRow {
  program_ids: number[];
}

export interface EntityListFilters {
  limit: number;
  page: number;
  search?: string;
  type?: number;
}

export async function list(filters: EntityListFilters): Promise<{ data: EntityRow[]; total: number }> {
  return repo.list(filters);
}

export async function getDetail(id: number): Promise<EntityDetail> {
  const entity = await repo.findById(id);
  if (!entity) throw new EntityNotFoundError(id);
  const programIds = (await repo.getProgramsByEntityIds([id]))[id] ?? [];
  return { ...entity, program_ids: programIds };
}

// Ported from entity.module.ts's create(): validate, insert, attach program
// associations. NOT ported: integration_associations upsert, publisher
// pub/sub call — neither is wired up in this scaffold yet.
export async function create(request: EntityRequest, createdBy: number): Promise<EntityDetail> {
  await validateEntityRequest(request);

  const { program_ids, external_properties, ...createData } = request;
  // entities.external_properties is stored as a JSON string column, not a
  // JSON column — matches the original's schema (Generated<string | null>).
  const createdId = await repo.create({ ...createData, external_properties: serializeExternalProperties(external_properties) }, createdBy);
  if (program_ids && program_ids.length) {
    await repo.setPrograms(createdId, program_ids);
  }

  return getDetail(createdId);
}

export async function update(id: number, request: EntityRequest, updatedBy: number): Promise<EntityDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new EntityNotFoundError(id);

  await validateEntityRequest(request, { excludeId: id });

  const { program_ids, external_properties, ...updateData } = request;
  await repo.update(id, { ...updateData, external_properties: serializeExternalProperties(external_properties) }, updatedBy);
  if (program_ids !== undefined) {
    await repo.setPrograms(id, program_ids ?? []);
  }

  return getDetail(id);
}

function serializeExternalProperties(value: Record<string, unknown> | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value === null ? null : JSON.stringify(value);
}

export async function remove(id: number, deletedBy: number): Promise<void> {
  await repo.softDelete(id, deletedBy);
}

// --- Import (bulk create) ---------------------------------------------------
// Same shape as material.service.ts's importRows — NOT the original's
// batch-optimized approach (one query per foreign-key set across all rows);
// this validates/creates one row at a time, which means N times the query
// count for a large import. Flagged as a real cost, not hidden — see the
// closing discussion on what reuse did and didn't buy here.

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export async function importRows(rows: unknown[], createdBy: number): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;

  for (const [index, row] of rows.entries()) {
    const parsed = EntityRequestSchema.safeParse(row);
    if (!parsed.success) {
      failed++;
      errors.push(`row ${index + 2}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`);
      continue;
    }
    try {
      await create(parsed.data, createdBy);
      imported++;
    } catch (err) {
      failed++;
      errors.push(`row ${index + 2}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { imported, failed, errors };
}
