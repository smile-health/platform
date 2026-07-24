import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("executive_users")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("village_id", "varchar(255)")
    .addColumn("entity_id", "int4")
    .addColumn("timezone_id", "int4")
    .addColumn("manufacture_id", "int4")
    .addColumn("role", "int4")
    .addColumn("username", "varchar(255)")
    .addColumn("password", "varchar(255)")
    .addColumn("email", "varchar(255)")
    .addColumn("firstname", "varchar(255)")
    .addColumn("lastname", "varchar(255)")
    .addColumn("date_of_birth", "date")
    .addColumn("gender", "int4")
    .addColumn("mobile_phone", "varchar(255)")
    .addColumn("address", "text")
    .addColumn("token_login", "text")
    .addColumn("mobile_phone_2", "varchar(255)")
    .addColumn("mobile_phone_brand", "varchar(255)")
    .addColumn("mobile_phone_model", "varchar(255)")
    .addColumn("imei_number", "varchar(255)")
    .addColumn("sim_id", "varchar(255)")
    .addColumn("sim_provider", "varchar(255)")
    .addColumn("iota_app_gui_theme", "varchar(255)")
    .addColumn("permission", "varchar(255)")
    .addColumn("application_version", "varchar(255)")
    .addColumn("last_mobile_access", "datetime")
    .addColumn("view_only", "int4", (col) => col.notNull().defaultTo(0))
    .addColumn("change_password", "smallint")
    .addColumn("fcm_token", "varchar(255)")
    .addColumn("external_properties", "text")
    .addColumn("daily_recap_email", "smallint")
    .addColumn("keycloak_uuid", "varchar(50)")
    .addColumn("user_uuid", "varchar(50)")
    .addColumn("status", "smallint")
    .addColumn("last_login", "date")
    .addColumn("last_device", "smallint")
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  await db.schema
    .createIndex("idx_executive_users_village_id")
    .on("executive_users")
    .column("village_id")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_entity_id")
    .on("executive_users")
    .column("entity_id")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_manufacture_id")
    .on("executive_users")
    .column("manufacture_id")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_role")
    .on("executive_users")
    .column("role")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_username")
    .on("executive_users")
    .column("username")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_email")
    .on("executive_users")
    .column("email")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_status")
    .on("executive_users")
    .column("status")
    .execute()

  await db
    .insertInto("executive_users")
    .values({
      id: 1,
      village_id: 1,
      entity_id: 1,
      timezone_id: 1,
      manufacture_id: 1,
      role: 1,
      username: "executive_superadmin",
      password: "$2b$10$p2TwoiUhjT0AO6t/EHNsU.fCOnZLJlsWIaOMlatEc97sPx3r32q2e",
      email: "superadmin@example.com",
      firstname: "Super",
      lastname: "Admin",
      date_of_birth: "1990-01-01",
      gender: 1,
      mobile_phone: "081234567890",
      address: "Head Office",
      last_mobile_access: new Date(),
      view_only: 0,
      change_password: 0,
      daily_recap_email: 1,
      status: 1,
    })
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("executive_users").execute()
}
