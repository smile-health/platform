// Business/orchestration layer — this is the piece that was missing from
// the first pass (controller was calling repo + validation directly,
// collapsing the original's Controller -> Module -> Repository layering
// into just Controller -> Repository). This mirrors material.module.ts:
// the controller's job shrinks to decode request / map errors to HTTP: this
// file owns "what does creating/updating/deleting a material actually mean"
// (validate, write, manage program + parent-hierarchy associations, cascade
// status to descendants), the repository owns single-table queries only.
import * as repo from "./material.repository";
import { validateMaterialRequest } from "./material.validation";
import { MaterialRequestSchema, type MaterialRequest } from "./material.schema";
import type { MaterialRow } from "./material.repository";

export class MaterialNotFoundError extends Error {
  constructor(id: number) {
    super(`Material ${id} not found`);
  }
}

export interface MaterialDetail extends MaterialRow {
  program_ids: number[];
  parent_ids: number[];
}

export interface MaterialListFilters {
  limit: number;
  page: number;
  search?: string;
  materialLevelIds?: number[];
  materialTypeIds?: number[];
  status?: number;
}

export async function list(filters: MaterialListFilters): Promise<{ data: MaterialRow[]; total: number }> {
  return repo.findAll(filters);
}

export async function getDetail(id: number): Promise<MaterialDetail> {
  const material = await repo.findById(id);
  if (!material) throw new MaterialNotFoundError(id);
  const [programIds, parentIds] = await Promise.all([
    repo.getProgramsByMaterialIds([id]).then((byId) => byId[id] ?? []),
    repo.findParentIds(id),
  ]);
  return { ...material, program_ids: programIds, parent_ids: parentIds };
}

export async function getRelations(id: number): Promise<{ id: number; name: string; childIds: number[]; parentIds: number[] }> {
  const material = await repo.findById(id);
  if (!material) throw new MaterialNotFoundError(id);
  const [childIds, parentIds] = await Promise.all([repo.findChildIdsRecursive(id), repo.findParentIds(id)]);
  return { id: material.id, name: material.name, childIds, parentIds };
}

// Ported from material.module.ts's create(): validate, insert, attach
// program/parent associations, return the assembled detail — same sequence
// as the original (just without the integration_associations upsert or the
// publisher.processCreate() pub/sub call, neither ported yet).
export async function create(request: MaterialRequest, createdBy: number): Promise<MaterialDetail> {
  await validateMaterialRequest(request);

  const { material_parent_ids, program_ids, is_hierarchy, ...createData } = request;
  void is_hierarchy; // consumed entirely by validateMaterialRequest's hierarchy rules — nothing left to persist directly.

  const createdId = await repo.create({ ...createData, status: 1 }, createdBy);
  await Promise.all([
    program_ids && program_ids.length ? repo.setPrograms(createdId, program_ids) : Promise.resolve(),
    material_parent_ids && material_parent_ids.length ? repo.setParentRelations(createdId, material_parent_ids) : Promise.resolve(),
  ]);

  return getDetail(createdId);
}

// Ported from material.module.ts's update(). NOT ported: the original's
// restricted-field-on-active-material guard is already enforced inside
// validateMaterialRequest (see material.validation.ts's findInTransaction/
// findInStockOpname checks) — this just persists once validation passes.
export async function update(id: number, request: MaterialRequest, updatedBy: number): Promise<MaterialDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new MaterialNotFoundError(id);

  await validateMaterialRequest(request, { excludeId: id });

  const { material_parent_ids, program_ids, is_hierarchy, ...updateData } = request;
  void is_hierarchy;

  await repo.update(id, updateData, updatedBy);
  await Promise.all([
    program_ids !== undefined ? repo.setPrograms(id, program_ids ?? []) : Promise.resolve(),
    material_parent_ids !== undefined ? repo.setParentRelations(id, material_parent_ids ?? []) : Promise.resolve(),
  ]);

  return getDetail(id);
}

// Ported from material.module.ts's updateStatus() — cascades status to
// every descendant material (findChildIdsRecursive), matching the
// original's "status change propagates down the hierarchy" behavior.
export async function updateStatus(id: number, status: number): Promise<MaterialDetail> {
  const material = await repo.findById(id);
  if (!material) throw new MaterialNotFoundError(id);

  const childIds = await repo.findChildIdsRecursive(id);
  await repo.updateStatus([id, ...childIds], status);

  return getDetail(id);
}

export async function remove(id: number, deletedBy: number): Promise<void> {
  await repo.softDelete(id, deletedBy);
}

// --- Import (bulk create) ---------------------------------------------------

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

// Ported from material.module.ts's import() — the original just loops
// create() per row; this does the same but collects per-row failures
// instead of letting one bad row abort the whole batch (the original's
// version doesn't even await each create(), so a failure would be an
// unhandled rejection — this is a deliberate improvement, not just a port).
//
// Takes `unknown[]` (raw parsed-but-unvalidated rows from the excel reader)
// rather than `MaterialRequest[]` — the excel parser only does type
// coercion (Number()/String()), it doesn't guarantee the result actually
// satisfies MaterialRequestSchema's constraints, so that check has to
// happen per-row here rather than being assumed by the caller.
export async function importRows(rows: unknown[], createdBy: number): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;

  for (const [index, row] of rows.entries()) {
    const parsed = MaterialRequestSchema.safeParse(row);
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
