import { db } from "@/common/infrastructure/database/index.js"
import { sql } from "kysely"

export const cleansingUnreceivedQty = async () => {
  try {
    // Backup tables before updates
    await sql`
      CREATE TABLE IF NOT EXISTS backup_ws_stocks_unreceived_non_batch AS
      SELECT DISTINCT
        s.id, s.unreceived_qty
      FROM
        ws_stocks s
        JOIN ws_transactions t ON (s.id = t.stock_id)
      WHERE
        s.unreceived_qty > 0
        AND s.deleted_at IS NULL
        AND t.transaction_type_id = 3
        AND s.batch_id IS NULL
        AND NOT EXISTS (
          SELECT
            1
          FROM
            ws_orders o
            JOIN ws_order_item_stocks i ON (o.id = i.order_id)
            JOIN ws_stocks ss ON (ss.id = i.stock_id)
          WHERE
            o.order_status_id = 4
            AND s.entity_id = o.customer_id
            AND s.material_id = ss.material_id
            AND s.activity_id = o.activity_id
        )
    `.execute(db)

    await sql`
      CREATE TABLE IF NOT EXISTS backup_ws_stocks_unreceived_batch AS
      SELECT DISTINCT
        s.id, s.unreceived_qty
      FROM
        ws_stocks s
        JOIN ws_transactions t ON (s.id = t.stock_id)
      WHERE
        s.unreceived_qty > 0
        AND s.deleted_at IS NULL
        AND t.transaction_type_id = 3
        AND s.batch_id IS NOT NULL
        AND NOT EXISTS (
          SELECT
            1
          FROM
            ws_orders o
            JOIN ws_order_item_stocks i ON (o.id = i.order_id)
            JOIN ws_stocks ss ON (ss.id = i.stock_id)
          WHERE
            o.order_status_id = 4
            AND s.entity_id = o.customer_id
            AND s.material_id = ss.material_id
            AND s.activity_id = o.activity_id
            AND s.batch_code = ss.batch_code
        )
    `.execute(db)

    await sql`
      CREATE TABLE IF NOT EXISTS backup_ws_stocks_in_transit AS
      SELECT
        s.id, s.in_transit_qty
      FROM
        ws_stocks s
      WHERE
        s.in_transit_qty > 0
        AND s.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT
            1
          FROM
            ws_orders o
            JOIN ws_order_item_stocks i ON o.id = i.order_id
          WHERE
            i.stock_id = s.id
            AND o.order_status_id = 4
        )
    `.execute(db)

    console.log("Backup tables created successfully")

    // Update unreceived_qty to 0 using backup tables
    await sql`
      UPDATE ws_stocks
      SET unreceived_qty = 0
      WHERE id IN (SELECT id FROM backup_ws_stocks_unreceived_non_batch)
    `.execute(db)

    await sql`
      UPDATE ws_stocks
      SET unreceived_qty = 0
      WHERE id IN (SELECT id FROM backup_ws_stocks_unreceived_batch)
    `.execute(db)

    // Update in_transit_qty to 0 using backup table
    await sql`
      UPDATE ws_stocks
      SET in_transit_qty = 0
      WHERE id IN (SELECT id FROM backup_ws_stocks_in_transit)
    `.execute(db)

    console.log("Cleansing completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error", error)
    process.exit(1)
  }
}
