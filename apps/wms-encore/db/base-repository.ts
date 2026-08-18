import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Database } from "./db";

export class BaseRepository {
  protected db: Kysely<Database>;

  constructor(sqlDb: SQLDatabase) {
    this.db = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString: sqlDb.connectionString }),
      }),
    });
  }
}
