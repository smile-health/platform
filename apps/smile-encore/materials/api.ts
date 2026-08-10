import { api, APIError, Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db, resolveUserId } from "./db";

export interface Material {
  id: number;
  name: string;
  description: string | null;
  code: string;
  materialLevelId: number;
  unitOfConsumptionId: number;
  unitOfDistributionId: number;
  materialTypeId: number;
  status: number;
}

interface ListMaterialsParams {
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListMaterialsResponse {
  materials: Material[];
  total: number;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export const list = api(
  { method: "GET", path: "/materials", expose: true, auth: true },
  async ({ limit, offset }: ListMaterialsParams): Promise<ListMaterialsResponse> => {
    const take = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const skip = offset ?? 0;

    const rows = await db
      .selectFrom("materials")
      .selectAll()
      .where("deleted_at", "is", null)
      .orderBy("id", "desc")
      .limit(take)
      .offset(skip)
      .execute();

    const { count } = await db
      .selectFrom("materials")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("deleted_at", "is", null)
      .executeTakeFirstOrThrow();

    return { materials: rows.map(toMaterial), total: Number(count) };
  },
);

interface GetMaterialParams {
  id: number;
}

export const get = api(
  { method: "GET", path: "/materials/:id", expose: true, auth: true },
  async ({ id }: GetMaterialParams): Promise<Material> => {
    const row = await db
      .selectFrom("materials")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    if (!row) {
      throw APIError.notFound(`material ${id} not found`);
    }
    return toMaterial(row);
  },
);

interface CreateMaterialRequest {
  name: string;
  description?: string;
  code: string;
  materialLevelId?: number;
  unitOfConsumptionId?: number;
  unitOfDistributionId?: number;
  materialTypeId?: number;
}

// Sensible defaults observed from existing data, used when the caller
// doesn't specify a reference id — this rewrite doesn't yet expose the
// material level / unit / type lookup tables in its own UI.
const DEFAULTS = {
  materialLevelId: 3,
  unitOfConsumptionId: 2,
  unitOfDistributionId: 6,
  materialTypeId: 2,
};

export const create = api(
  { method: "POST", path: "/materials", expose: true, auth: true },
  async (req: CreateMaterialRequest): Promise<Material> => {
    if (!req.name || !req.code) {
      throw APIError.invalidArgument("name and code are required");
    }

    const auth = getAuthData()!;
    const userId = await resolveUserId(auth.userID);

    const result = await db
      .insertInto("materials")
      .values({
        name: req.name,
        description: req.description ?? null,
        code: req.code,
        material_level_id: req.materialLevelId ?? DEFAULTS.materialLevelId,
        unit_of_consumption_id: req.unitOfConsumptionId ?? DEFAULTS.unitOfConsumptionId,
        unit_of_distribution_id: req.unitOfDistributionId ?? DEFAULTS.unitOfDistributionId,
        consumption_unit_per_distribution_unit: 1,
        is_temperature_sensitive: 0,
        min_retail_price: 0,
        max_retail_price: 0,
        material_type_id: req.materialTypeId ?? DEFAULTS.materialTypeId,
        is_managed_in_batch: 0,
        status: 1,
        created_by: userId,
        updated_by: userId,
        is_stock_opname_mandatory: 0,
        is_kfa: 1,
      })
      .executeTakeFirstOrThrow();

    const id = Number(result.insertId);
    const row = await db.selectFrom("materials").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
    return toMaterial(row);
  },
);

interface UpdateMaterialParams {
  id: number;
}

interface UpdateMaterialRequest {
  name?: string;
  description?: string;
  code?: string;
  status?: number;
}

export const update = api(
  { method: "PUT", path: "/materials/:id", expose: true, auth: true },
  async ({ id, ...req }: UpdateMaterialParams & UpdateMaterialRequest): Promise<Material> => {
    const existing = await db
      .selectFrom("materials")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    if (!existing) {
      throw APIError.notFound(`material ${id} not found`);
    }

    const auth = getAuthData()!;
    const userId = await resolveUserId(auth.userID);

    await db
      .updateTable("materials")
      .set({
        name: req.name ?? existing.name,
        description: req.description ?? existing.description,
        code: req.code ?? existing.code,
        status: req.status ?? existing.status,
        updated_by: userId,
      })
      .where("id", "=", id)
      .execute();

    const row = await db.selectFrom("materials").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
    return toMaterial(row);
  },
);

interface DeleteMaterialParams {
  id: number;
}

// Soft-deletes, matching the table's existing deleted_at/deleted_by convention —
// this rewrite must not hard-delete rows from the shared inventory table.
export const remove = api(
  { method: "DELETE", path: "/materials/:id", expose: true, auth: true },
  async ({ id }: DeleteMaterialParams): Promise<void> => {
    const existing = await db
      .selectFrom("materials")
      .select("id")
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    if (!existing) {
      throw APIError.notFound(`material ${id} not found`);
    }

    const auth = getAuthData()!;
    const userId = await resolveUserId(auth.userID);

    await db
      .updateTable("materials")
      .set({ deleted_at: new Date(), deleted_by: userId })
      .where("id", "=", id)
      .execute();
  },
);

function toMaterial(row: {
  id: number;
  name: string;
  description: string | null;
  code: string;
  material_level_id: number;
  unit_of_consumption_id: number;
  unit_of_distribution_id: number;
  material_type_id: number;
  status: number;
}): Material {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    code: row.code,
    materialLevelId: row.material_level_id,
    unitOfConsumptionId: row.unit_of_consumption_id,
    unitOfDistributionId: row.unit_of_distribution_id,
    materialTypeId: row.material_type_id,
    status: row.status,
  };
}
