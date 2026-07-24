import { execQuery } from "@/common/infrastructure/database/clickhouse/index.js"

export class BaseRepository {
  constructor() {}

  async fetchLastUpdated(table: string): Promise<string | null> {
    const result = await execQuery<{ last_updated: string }>(
      `
      SELECT
        max(ingested_at) as last_updated
      FROM ${table}
    `,
      {}
    )
    return result[0]?.last_updated || null
  }
}
