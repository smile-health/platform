import { Generated, Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { dbConfig } from "../config";

// This matches the REAL `materials` table already used by the existing SMILE
// warehouse/inventory system in the shared dev_smile_health database — this
// rewrite reads and writes the same live table, not a fresh one.
export interface MaterialTable {
  id: Generated<number>;
  name: string;
  description: string | null;
  material_level_id: number;
  code: string;
  hierarchy_code: string | null;
  unit_of_consumption_id: number;
  unit_of_distribution_id: number;
  consumption_unit_per_distribution_unit: number;
  is_temperature_sensitive: number;
  min_retail_price: number;
  max_retail_price: number;
  min_temperature: number | null;
  max_temperature: number | null;
  material_type_id: number;
  material_subtype_id: number | null;
  is_managed_in_batch: number;
  status: number;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
  is_stock_opname_mandatory: Generated<number>;
  is_kfa: Generated<number>;
}

export interface UserTable {
  id: number;
  keycloak_uuid: string | null;
}

export interface Database {
  materials: MaterialTable;
  users: UserTable;
}

const dialect = new MysqlDialect({
  pool: createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  }),
});

export const db = new Kysely<Database>({ dialect });

// Resolves the acting user's numeric id (used for created_by/updated_by) from
// their Keycloak subject. Falls back to 0 when there's no matching SMILE user
// row, since this rewrite doesn't (yet) provision users of its own.
export async function resolveUserId(keycloakSub: string): Promise<number> {
  const user = await db.selectFrom("users").select("id").where("keycloak_uuid", "=", keycloakSub).executeTakeFirst();
  return user?.id ?? 0;
}
