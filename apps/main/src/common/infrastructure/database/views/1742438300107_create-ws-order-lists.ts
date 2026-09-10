import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createView("ws_order_lists")
    .orReplace()
    .as(
      db
        .selectFrom("ws_orders as wso")
        .innerJoin("ws_entities as wse_customer", (join) =>
          join
            .onRef("wse_customer.id", "=", "wso.customer_id")
            .on("wse_customer.deleted_at", "is", null)
        )
        .innerJoin("ws_entities as wse_vendor", (join) =>
          join
            .onRef("wse_vendor.id", "=", "wso.vendor_id")
            .on("wse_vendor.deleted_at", "is", null)
        )
        .innerJoin("ws_activities as wsa", (join) =>
          join
            .onRef("wsa.id", "=", "wso.activity_id")
            .on("wsa.deleted_at", "is", null)
        )
        .innerJoin("ws_users as wsu_created", (join) =>
          join
            .onRef("wsu_created.id", "=", "wso.created_by")
            .on("wsu_created.deleted_by", "is", null)
        )
        .innerJoin("ws_order_audits as woa", (join) =>
          join
            .onRef("woa.order_id", "=", "wso.id")
            .on("woa.deleted_at", "is", null)
        )
        .leftJoin("ws_order_statuses as wos", (join) =>
          join
            .onRef("wos.id", "=", "wso.order_status_id")
            .on("wos.deleted_at", "is", null)
        )
        .leftJoin("ws_order_types as wot", (join) =>
          join
            .onRef("wot.id", "=", "wso.order_type_id")
            .on("wot.deleted_at", "is", null)
        )
        .leftJoin("ws_delivery_types as wdt", (join) =>
          join
            .onRef("wdt.id", "=", "wso.delivery_type_id")
            .on("wdt.deleted_at", "is", null)
        )
        .leftJoin("ws_users as wsu_updated", (join) =>
          join
            .onRef("wsu_updated.id", "=", "wso.updated_by")
            .on("wsu_updated.deleted_by", "is", null)
        )
        // ws_entities has a single location_id (+ locations.path) instead of
        // separate province/regency/sub_district/village id columns, so the
        // ancestor ids/names below are derived via SUBSTRING_INDEX(path, ...)
        // rather than joining on those flat columns directly. Mirrors
        // EntityRepository#joinLocationHierarchy.
        .leftJoin(
          "locations as vendor_loc",
          "vendor_loc.id",
          "wse_vendor.location_id"
        )
        .leftJoin("locations as province_vendor", (join) =>
          join.on(
            sql`province_vendor.id = SUBSTRING_INDEX(vendor_loc.path, '#', 1)`
          )
        )
        .leftJoin("locations as regency_vendor", (join) =>
          join.on(
            sql`regency_vendor.id = CASE WHEN vendor_loc.level >= 1 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(vendor_loc.path, '#', 2), '#', -1) ELSE NULL END`
          )
        )
        .leftJoin(
          "locations as customer_loc",
          "customer_loc.id",
          "wse_customer.location_id"
        )
        .leftJoin("locations as province_customer", (join) =>
          join.on(
            sql`province_customer.id = SUBSTRING_INDEX(customer_loc.path, '#', 1)`
          )
        )
        .leftJoin("locations as regency_customer", (join) =>
          join.on(
            sql`regency_customer.id = CASE WHEN customer_loc.level >= 1 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(customer_loc.path, '#', 2), '#', -1) ELSE NULL END`
          )
        )
        .leftJoin("locations as sub_district_vendor", (join) =>
          join.on(
            sql`sub_district_vendor.id = CASE WHEN vendor_loc.level >= 2 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(vendor_loc.path, '#', 3), '#', -1) ELSE NULL END`
          )
        )
        .leftJoin("locations as sub_district_customer", (join) =>
          join.on(
            sql`sub_district_customer.id = CASE WHEN customer_loc.level >= 2 THEN SUBSTRING_INDEX(SUBSTRING_INDEX(customer_loc.path, '#', 3), '#', -1) ELSE NULL END`
          )
        )
        .select([
          "wso.id as order_id",
          "wso.device_type",
          "wso.order_status_id as status_id",
          "wos.name as status_name",
          "wso.order_type_id as type_id",
          "wso.delivery_type_id as delivery_type_id",
          "wot.name as type_name",
          "wso.created_at as order_created_at",
          "wso.updated_at as order_updated_at",
          "wso.total_order_items",
          "wso.created_by as user_created_by",
          sql<string>`CONCAT_WS(' ', wsu_created.firstname, wsu_created.lastname)`.as(
            "created_by_name"
          ),
          "wso.updated_by as user_updated_by",
          sql<string>`CONCAT_WS(' ', wsu_updated.firstname, wsu_updated.lastname)`.as(
            "updated_by_name"
          ),
          "wse_vendor.id as vendor_id",
          "wse_vendor.name as vendor_name",
          "wse_vendor.entity_tag_id as vendor_entity_tag_id",
          "wse_vendor.location_id as vendor_location_id",
          "province_vendor.id as vendor_province_id",
          "regency_vendor.id as vendor_regency_id",
          "sub_district_vendor.id as vendor_sub_district_id",
          "wse_customer.location_id as customer_location_id",
          "province_customer.id as customer_province_id",
          "regency_customer.id as customer_regency_id",
          "sub_district_customer.id as customer_sub_district_id",
          "province_vendor.name as vendor_province_name",
          "regency_vendor.name as vendor_regency_name",
          "wse_customer.id as customer_id",
          "wse_customer.name as customer_name",
          "wse_customer.entity_tag_id as customer_entity_tag_id",
          "province_customer.name as customer_province_name",
          "regency_customer.name as customer_regency_name",
          "wsa.id as activity_id",
          "wsa.name as activity_name",
          "wsa.program_id as program_id",
          "woa.confirmed_by",
          "woa.shipped_by",
          "woa.fulfilled_by",
          "woa.cancelled_by",
          "woa.allocated_by",
          "woa.confirmed_at",
          "woa.shipped_at",
          "woa.fulfilled_at",
          "woa.cancelled_at",
          "woa.allocated_at",
          "wdt.name as delivery_type_name",
          "wso.no_document as doc_no",
          "wso.notes",
          "wso.no_po as po_no",
          "wso.is_allocated",
          "wso.delivery_number",
          "wso.purchase_ref",
          "wso.sales_ref",
          "wso.metadata",
        ])
        .where("wso.deleted_at", "is", null)
        .where("wso.activity_id", "is not", null)
    )
    .execute()
}
