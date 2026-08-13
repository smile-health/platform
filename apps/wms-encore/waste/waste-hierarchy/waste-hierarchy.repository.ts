// Postgres columns for table `waste_hierarchy` (mirrors
// infrastructure/database/models/WasteHierarchyModel.ts field-for-field):
//
//   id                  integer, unsigned, auto-increment, primary key
//   created_by          varchar(32), not null
//   updated_by          varchar(32), not null
//   region_id           integer, unsigned, not null (FK -> regions.id)
//   parent_hierarchy_id integer, unsigned, nullable (FK -> waste_hierarchy.id, self-referencing)
//   name                varchar(64), not null
//   name_en             varchar(64), not null
//   description         varchar(255), nullable
//   description_en      varchar(255), nullable
//   level               integer, unsigned, not null, default 0
//     -- not a real enum column in the original, but enum-like in practice:
//     -- 0 = waste type, 1 = waste group, 2 = waste characteristics (leaf,
//     -- what waste_classification hangs off via waste_characteristics_id).
//   is_residue          boolean, nullable, default false
//   is_active           boolean, nullable, default true
//   created_at          timestamp, not null
//   updated_at          timestamp, not null
//   deleted_at          timestamp, nullable (paranoid soft-delete — see note
//                       on softDelete() below: the original never actually
//                       sets this column despite the model supporting it)
//   deleted_by          bigint, nullable (same note — never set either)
//
// Referenced table `waste_classification` (existence-guards + leaf lookup
// only; mirrors WasteClassificationRepositoryImpl.findWasteClassificationByCondition
// and the wasteCode join in getWasteHierarchyByParentHierarchyId):
//
//   id                       integer, unsigned, auto-increment, primary key
//   waste_type_id            integer, unsigned, not null
//   waste_group_id           integer, unsigned, not null
//   waste_characteristics_id integer, unsigned, not null
//   waste_code               varchar, not null
//   deleted_at               timestamp, nullable (paranoid soft-delete)
//
// Referenced table `regions` (already registered — see db/db.ts's
// RegionsTable/`regions` — used here only for CreateWasteHierarchy's
// "pick any region as the default regionId" fallback, mirroring
// RegionRepositoryImpl.getOneRegion, which is just `findOne()` with no
// ordering/filter).

import { db } from "../../db/db";
import type {
  WasteHierarchy,
  WasteHierarchySummary,
  WasteClassificationSummary,
  WasteClassificationExplanation,
  PaginationMeta,
} from "./waste-hierarchy.types";

function toSummary(row: {
  id: number;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  parent_hierarchy_id: number | null;
  region_id: number;
}): WasteHierarchySummary {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    parentHierarchyId: row.parent_hierarchy_id ?? undefined,
    regionId: row.region_id,
  };
}

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  region_id: number;
  parent_hierarchy_id: number | null;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  level: number;
  is_residue: boolean | null;
  is_active: boolean | null;
  created_at: Date;
  updated_at: Date;
}): WasteHierarchy {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    regionId: row.region_id,
    parentHierarchyId: row.parent_hierarchy_id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    level: row.level,
    isResidue: row.is_residue ?? undefined,
    isActive: row.is_active ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Mirrors getWasteHierarchyById's `wasteType`/`wasteGroup` belongsTo
// self-associations (scoped to level 0 / level 1 respectively) plus the
// extra "climb one more level" lookup the original does when the row itself
// is level 2 (its wasteGroup's parent becomes wasteType).
export async function findById(id: number): Promise<WasteHierarchy | null> {
  const row = await db
    .selectFrom("waste_hierarchy")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!row) return null;

  const entity = toEntity(row);

  if (row.parent_hierarchy_id != null) {
    const parent = await db
      .selectFrom("waste_hierarchy")
      .selectAll()
      .where("id", "=", row.parent_hierarchy_id)
      .executeTakeFirst();
    if (parent) {
      if (parent.level === 0) {
        entity.wasteType = toSummary(parent);
      } else if (parent.level === 1) {
        entity.wasteGroup = toSummary(parent);
        if (parent.parent_hierarchy_id != null) {
          const grandparent = await db
            .selectFrom("waste_hierarchy")
            .selectAll()
            .where("id", "=", parent.parent_hierarchy_id)
            .executeTakeFirst();
          if (grandparent) entity.wasteType = toSummary(grandparent);
        }
      }
    }
  }

  return entity;
}

// Mirrors getWasteHierarchyByParentHierarchyId — active children of a given
// parent, enriched with the leaf's waste_classification.wasteCode when the
// child is level 2.
export async function findByParentHierarchyId(parentHierarchyId: number): Promise<WasteHierarchy[]> {
  const rows = await db
    .selectFrom("waste_hierarchy")
    .selectAll()
    .where("parent_hierarchy_id", "=", parentHierarchyId)
    .where("is_active", "=", true)
    .execute();

  return Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      if (row.level === 2) {
        const classification = await db
          .selectFrom("waste_classification")
          .select(["id", "waste_code"])
          .where("waste_characteristics_id", "=", row.id)
          .executeTakeFirst();
        if (classification) {
          entity.wasteClassification = {
            id: classification.id,
            wasteCode: classification.waste_code,
          } satisfies WasteClassificationSummary;
        }
      }
      return entity;
    })
  );
}

// Mirrors getWasteHierarchyByParentHierarchyIdNull — active top-level
// (parent_hierarchy_id IS NULL) rows, i.e. the waste types themselves.
export async function findByParentHierarchyIdNull(): Promise<WasteHierarchy[]> {
  const rows = await db
    .selectFrom("waste_hierarchy")
    .selectAll()
    .where("parent_hierarchy_id", "is", null)
    .where("is_active", "=", true)
    .execute();
  return rows.map(toEntity);
}

// Mirrors getAllWasteHierarchy's default `isActive` filter (1 when the
// caller omits the query param), search-by-name, and the wasteType/wasteGroup
// eager-load (level 2 rows filter through their wasteGroup's parent for
// wasteTypeId; other levels join wasteType/wasteGroup independently).
//
// The original also calls getUsersDetail(updatedBy, token) per-row to
// populate `userName` — wired up in waste-hierarchy.service.ts's
// getAllWasteHierarchy via getLocalUserName (local `users` table) instead of
// the HTTP round-trip.
export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  level?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  isActive: boolean;
}): Promise<{ data: WasteHierarchy[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("waste_hierarchy").where("is_active", "=", params.isActive);
  if (params.level !== undefined) {
    query = query.where("level", "=", params.level);
  }
  if (params.search) {
    query = query.where("name", "ilike", `%${params.search}%`);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);

      if (row.level === 2) {
        // Level-2 rows resolve wasteGroup/wasteType via their parent chain,
        // filtered by wasteGroupId/wasteTypeId when supplied (mirrors the
        // `required: true` include filters in the original).
        if (row.parent_hierarchy_id != null) {
          const group = await db
            .selectFrom("waste_hierarchy")
            .selectAll()
            .where("id", "=", row.parent_hierarchy_id)
            .where("level", "=", 1)
            .$if(params.wasteGroupId !== undefined, (qb) => qb.where("id", "=", params.wasteGroupId!))
            .executeTakeFirst();
          if (group) {
            entity.wasteGroup = toSummary(group);
            if (group.parent_hierarchy_id != null) {
              const type = await db
                .selectFrom("waste_hierarchy")
                .selectAll()
                .where("id", "=", group.parent_hierarchy_id)
                .where("level", "=", 0)
                .$if(params.wasteTypeId !== undefined, (qb) => qb.where("id", "=", params.wasteTypeId!))
                .executeTakeFirst();
              if (type) entity.wasteType = toSummary(type);
            }
          }
        }
      } else if (row.parent_hierarchy_id != null) {
        const parent = await db
          .selectFrom("waste_hierarchy")
          .selectAll()
          .where("id", "=", row.parent_hierarchy_id)
          .$if(params.wasteTypeId !== undefined, (qb) => qb.where("id", "=", params.wasteTypeId!))
          .$if(params.wasteGroupId !== undefined, (qb) => qb.where("id", "=", params.wasteGroupId!))
          .executeTakeFirst();
        if (parent) {
          if (parent.level === 0) entity.wasteType = toSummary(parent);
          else if (parent.level === 1) entity.wasteGroup = toSummary(parent);
        }
      }

      return entity;
    })
  );

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors findWasteHierarchyByCondition({name, parent_hierarchy_id}) — the
// exact-match duplicate-name lookup CreateWasteHierarchyUseCase runs (both
// its "does this name already exist" check and, for level 1/2, the
// name-scoped "parent" re-check that reuses the identical query — see the
// comment on that call site in waste-hierarchy.service.ts for why that
// second check is a preserved upstream bug, not a real parent-existence
// check).
export async function findByNameAndParent(
  name: string,
  parentHierarchyId?: number | null
): Promise<WasteHierarchy | null> {
  let query = db.selectFrom("waste_hierarchy").selectAll().where("name", "=", name);
  if (parentHierarchyId !== undefined) {
    query = query.where("parent_hierarchy_id", parentHierarchyId === null ? "is" : "=", parentHierarchyId);
  }
  const row = await query.executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors UpdateWasteHierarchyUseCase's duplicate-name-at-same-level check
// (`{name, level, id: {[Op.notIn]: [id]}}`).
export async function findByNameAndLevelExcludingId(
  name: string,
  level: number,
  excludeId: number
): Promise<WasteHierarchy | null> {
  const row = await db
    .selectFrom("waste_hierarchy")
    .selectAll()
    .where("name", "=", name)
    .where("level", "=", level)
    .where("id", "!=", excludeId)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors DeleteWasteHierarchyUseCase's first guard: refuse deletion while
// any row still has this id as its parent_hierarchy_id.
export async function hasChildren(id: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_hierarchy")
    .select("id")
    .where("parent_hierarchy_id", "=", id)
    .executeTakeFirst();
  return !!row;
}

// Mirrors DeleteWasteHierarchyUseCase's second guard: refuse deletion while
// any waste_classification row references this id as its
// waste_characteristics_id / waste_group_id / waste_type_id.
export async function isReferencedByWasteClassification(id: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_classification")
    .select("id")
    .where((eb) =>
      eb.or([
        eb("waste_characteristics_id", "=", id),
        eb("waste_group_id", "=", id),
        eb("waste_type_id", "=", id),
      ])
    )
    .executeTakeFirst();
  return !!row;
}

// Mirrors RegionRepositoryImpl.getOneRegion — literally "any one row",
// no ordering/filter in the original either.
export async function findOneRegion(): Promise<{ id: number } | null> {
  const row = await db.selectFrom("regions").select("id").executeTakeFirst();
  return row ?? null;
}

export async function create(payload: {
  createdBy: string;
  regionId: number;
  parentHierarchyId?: number | null;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  level: number;
  isResidue?: boolean;
  isActive?: boolean;
}): Promise<WasteHierarchy> {
  // Mirrors the original: updated_by set to createdBy on create.
  const row = await db
    .insertInto("waste_hierarchy")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      region_id: payload.regionId,
      parent_hierarchy_id: payload.parentHierarchyId ?? null,
      name: payload.name,
      name_en: payload.nameEn,
      description: payload.description ?? null,
      description_en: payload.descriptionEn ?? null,
      level: payload.level,
      is_residue: payload.isResidue ?? false,
      is_active: payload.isActive ?? true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    parentHierarchyId?: number | null;
    name: string;
    nameEn: string;
    description?: string;
    descriptionEn?: string;
    isResidue?: boolean;
    isActive?: boolean;
  }
): Promise<WasteHierarchy | null> {
  await db
    .updateTable("waste_hierarchy")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      parent_hierarchy_id: payload.parentHierarchyId ?? null,
      name: payload.name,
      name_en: payload.nameEn,
      description: payload.description ?? null,
      description_en: payload.descriptionEn ?? null,
      is_residue: payload.isResidue ?? null,
      is_active: payload.isActive ?? null,
    })
    .where("id", "=", id)
    .execute();
  return findById(id);
}

// Mirrors WasteHierarchyImpl.deleteWasteHierarchy verbatim: despite the
// model declaring `paranoid: true` (deleted_at/deleted_by soft-delete), the
// actual delete implementation only flips is_active to false — it never
// touches deleted_at/deleted_by. Preserved as-is rather than "fixed" to a
// real soft-delete, since other rows/queries in the original consistently
// filter on is_active, not deleted_at, for this table.
export async function deactivate(id: number): Promise<boolean> {
  const existing = await db
    .selectFrom("waste_hierarchy")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst();
  if (!existing) return false;

  await db.updateTable("waste_hierarchy").set({ is_active: false }).where("id", "=", id).execute();
  return true;
}

// Mirrors WasteHierarchyImpl.explanationOfWasteClassification's raw SQL
// 3-way self-join (waste type <- waste group <- waste characteristics),
// filtered to active (is_active = true — adapted from the original's MySQL
// `= 1`, since Postgres booleans reject integer comparisons) level-2 leaves.
export async function findExplanationOfWasteClassification(): Promise<WasteClassificationExplanation[]> {
  const rows = await db
    .selectFrom("waste_hierarchy as wc")
    .innerJoin("waste_hierarchy as wg", "wg.id", "wc.parent_hierarchy_id")
    .innerJoin("waste_hierarchy as wt", "wt.id", "wg.parent_hierarchy_id")
    .select([
      "wt.name as wasteTypeName",
      "wt.name_en as wasteTypeNameEn",
      "wt.description as wasteTypeDescription",
      "wt.description_en as wasteTypeDescriptionEn",
      "wg.name as wasteGroupName",
      "wg.name_en as wasteGroupNameEn",
      "wg.description as wasteGroupDescription",
      "wg.description_en as wasteGroupDescriptionEn",
      "wc.name as wasteCharacteristicsName",
      "wc.name_en as wasteCharacteristicsNameEn",
      "wc.description as wasteCharacteristicsDescription",
      "wc.description_en as wasteCharacteristicsDescriptionEn",
    ])
    .where("wc.level", "=", 2)
    .where("wc.is_active", "=", true)
    .where("wg.level", "=", 1)
    .where("wt.level", "=", 0)
    .execute();
  return rows as WasteClassificationExplanation[];
}
