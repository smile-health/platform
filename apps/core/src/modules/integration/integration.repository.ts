import { Context } from "hono"
import { Insertable, sql } from "kysely"
import { Client } from "./integration.schema"
import { WMSClient } from "./wms/wms.client"
import { IntegrationLogs } from "@/common/infrastructure/database/types/db"
import { db } from "@/common/infrastructure/database"

export class IntegrationRepository {
  public getClientByKey = async (
    c: Context,
    clientIdentifier?: string | number
  ): Promise<Client | undefined> => {
    if (!clientIdentifier) return

    const client = await c.var.trx
      .selectFrom("integration_clients")
      .selectAll()
      .$if(typeof clientIdentifier === "string", (eb) =>
        eb.where("key", "=", clientIdentifier as string)
      )
      .$if(typeof clientIdentifier === "number", (eb) =>
        eb.where("id", "=", clientIdentifier as number)
      )
      .executeTakeFirst()
    if (!client) return

    switch (client.key) {
      case "wms":
        return new WMSClient(client)

      default:
        return
    }
  }

  public upsertAssociation = async (
    c: Context,
    id: number,
    type: string,
    metadata: string | null | undefined = null,
    clientId: number | undefined = undefined
  ) => {
    const { client, trx } = c.var
    // Prefer the client from context, fallback to provided clientId
    const client_id = client?.getId() ?? clientId

    if (!client_id) {
      await trx
        .updateTable("integration_associations")
        .set({
          deleted_at: new Date(),
        })
        .where("internal_id", "=", id)
        .where("type", "=", type)
        .execute()
      return
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date(),
      deleted_at: null,
    }

    if (metadata !== null) {
      updateFields.metadata = sql`JSON_MERGE_PATCH(COALESCE(metadata, '{}'), VALUES(metadata))`
    }

    await trx
      .insertInto("integration_associations")
      .values({
        internal_id: id,
        client_id,
        type,
        metadata: metadata ?? null,
      })
      .onDuplicateKeyUpdate(updateFields)
      .execute()
  }

  public upsertAssociations = async (
    c: Context,
    clientId: number,
    rows: {
      id: number
      type: string
      metadata: string | null
    }[]
  ) => {
    const { trx } = c.var

    await trx
      .insertInto("integration_associations")
      .values(
        rows.map(({ id, type, metadata }) => ({
          internal_id: id,
          client_id: clientId,
          type,
          metadata: metadata ?? {},
        }))
      )
      .onDuplicateKeyUpdate({
        updated_at: sql`NOW()`,
        metadata: sql`JSON_MERGE_PATCH(COALESCE(metadata, '{}'), VALUES(metadata))`,
      })
      .execute()
  }

  public createLog = async (row: Insertable<IntegrationLogs>) => {
    return await db.insertInto("integration_logs").values(row).execute()
  }
}
