/**
 * Route Mapping Repository, Data access layer for route mappings
 */

import type { Kysely } from "kysely";
import type { Logger } from "pino";
import type {
  Database,
  RouteMappingTable,
} from "../../common/infrastructure/database";
import type { RouteMapping } from "../../common/types/router";
import { routeMappingSchema } from "../../common/utils/validation";

// Repository for accessing route mappings
export class RouteMappingRepository {
  private cache: Map<string, RouteMapping> = new Map();
  private cacheLoaded = false;
  private logger: Logger;
  // Change-detection state: track what the DB looked like after the last load
  private lastKnownMaxUpdatedAt: string | null = null;
  private lastKnownRowCount: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private db: Kysely<Database>,
    logger: Logger,
  ) {
    this.logger = logger;
  }

  // Loads all mappings from database into memory cache
  async loadMappings(): Promise<void> {
    try {
      this.logger.info("Loading route mappings from database");

      const rows = await this.db
        .selectFrom("openhim_route_mappings")
        .selectAll()
        .execute();

      this.cache.clear();

      for (const row of rows) {
        const mapping = this.rowToMapping(row);
        this.cache.set(mapping.rabbitmq_topic, mapping);
      }

      this.cacheLoaded = true;

      // Record baseline for change detection
      const snapshot = await this.db
        .selectFrom("openhim_route_mappings")
        .select((eb) => [
          eb.fn.max("updated_at").as("max_updated_at"),
          eb.fn.count("id").as("row_count"),
        ])
        .executeTakeFirst();
      this.lastKnownMaxUpdatedAt = snapshot?.max_updated_at
        ? String(snapshot.max_updated_at)
        : null;
      this.lastKnownRowCount = Number(snapshot?.row_count ?? 0);

      this.logger.info(
        { count: this.cache.size },
        "Route mappings loaded from database",
      );
    } catch (error) {
      // If the table doesn't exist yet (e.g., migrations haven't run), continue gracefully
      // The table will be created by migrations or manual SQL execution
      if (
        error instanceof Error &&
        (error.message.includes("Table") || error.message.includes("table"))
      ) {
        this.logger.warn(
          { error: error.message },
          "Route mappings table does not exist yet - skipping load. Run migrations or create tables manually.",
        );
        this.cacheLoaded = true; // Mark as loaded to avoid repeated attempts
        return;
      }

      this.logger.error({ error }, "Failed to load route mappings");
      throw error;
    }
  }

  // Gets a mapping by RabbitMQ topic
  getMappingByTopic(topic: string): RouteMapping | null {
    if (!this.cacheLoaded) {
      this.logger.warn("Cache not loaded, call loadMappings() first");
      return null;
    }

    return this.cache.get(topic) || null;
  }

  // Gets all enabled mappings
  getEnabledMappings(): RouteMapping[] {
    if (!this.cacheLoaded) {
      this.logger.warn("Cache not loaded, call loadMappings() first");
      return [];
    }

    return Array.from(this.cache.values()).filter((m) => m.enabled);
  }

  // Gets all registered topics
  getTopics(): string[] {
    return Array.from(this.cache.keys());
  }

  // Refreshes the cache by reloading from database
  async refresh(): Promise<void> {
    this.logger.debug("Refreshing route mappings cache");
    await this.loadMappings();
  }

  // Adds or updates a route mapping in the database
  async upsert(mapping: Partial<RouteMapping>): Promise<RouteMapping> {
    try {
      const result = await this.db
        .insertInto("openhim_route_mappings")
        .values(mapping as RouteMappingTable)
        .onDuplicateKeyUpdate({
          enabled: mapping.enabled,
          max_retries: mapping.max_retries,
          updated_at: new Date().toISOString(),
        })
        .executeTakeFirst();

      // Refresh cache
      await this.loadMappings();

      const saved = this.getMappingByTopic(mapping.rabbitmq_topic || "");
      if (!saved) {
        throw new Error("Failed to retrieve saved mapping");
      }

      return saved;
    } catch (error) {
      this.logger.error({ error, mapping }, "Failed to upsert mapping");
      throw error;
    }
  }

  // Disables a mapping by topic
  async disable(topic: string): Promise<void> {
    try {
      await this.db
        .updateTable("openhim_route_mappings")
        .set({ enabled: false, updated_at: new Date().toISOString() })
        .where("rabbitmq_topic", "=", topic)
        .execute();

      // Refresh cache
      await this.loadMappings();

      this.logger.info({ topic }, "Route mapping disabled");
    } catch (error) {
      this.logger.error({ error, topic }, "Failed to disable mapping");
      throw error;
    }
  }

  // Enables a mapping by topic
  async enable(topic: string): Promise<void> {
    try {
      await this.db
        .updateTable("openhim_route_mappings")
        .set({ enabled: true, updated_at: new Date().toISOString() })
        .where("rabbitmq_topic", "=", topic)
        .execute();

      // Refresh cache
      await this.loadMappings();

      this.logger.info({ topic }, "Route mapping enabled");
    } catch (error) {
      this.logger.error({ error, topic }, "Failed to enable mapping");
      throw error;
    }
  }

  // Check if cache is loaded
  isLoaded(): boolean {
    return this.cacheLoaded;
  }

  // Starts periodic change-detection. Skipped if intervalMs is 0.
  // Each tick runs a cheap MAX(updated_at)+COUNT(*) query. Full reload only if something changed.
  startAutoRefresh(intervalMs: number): void {
    if (intervalMs === 0) return;

    this.stopAutoRefresh(); // clear any existing timer
    this.refreshTimer = setInterval(async () => {
      try {
        await this.checkAndRefresh();
      } catch (error) {
        // Stale cache beats crashing. Next tick will retry.
        this.logger.error({ error }, "Route mapping auto-refresh check failed");
      }
    }, intervalMs);

    this.logger.info({ intervalMs }, "Route mapping auto-refresh started");
  }

  // Stops the auto-refresh timer.
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Lightweight change detection: one cheap query. Full reload only if DB state changed.
  private async checkAndRefresh(): Promise<void> {
    const snapshot = await this.db
      .selectFrom("openhim_route_mappings")
      .select((eb) => [
        eb.fn.max("updated_at").as("max_updated_at"),
        eb.fn.count("id").as("row_count"),
      ])
      .executeTakeFirst();

    const currentMaxUpdatedAt = snapshot?.max_updated_at
      ? String(snapshot.max_updated_at)
      : null;
    const currentRowCount = Number(snapshot?.row_count ?? 0);

    const changed =
      currentMaxUpdatedAt !== this.lastKnownMaxUpdatedAt ||
      currentRowCount !== this.lastKnownRowCount;

    if (changed) {
      this.logger.info(
        {
          previousMaxUpdatedAt: this.lastKnownMaxUpdatedAt,
          currentMaxUpdatedAt,
          previousRowCount: this.lastKnownRowCount,
          currentRowCount,
        },
        "Route mapping change detected - reloading cache",
      );
      await this.loadMappings();
    }
  }

  // Convert database row to RouteMapping type - validated at runtime
  private rowToMapping(row: RouteMappingTable): RouteMapping {
    return routeMappingSchema.parse(row);
  }
}

// Factory function to create a repository instance
export function createRouteMappingRepository(
  db: Kysely<Database>,
  logger: Logger,
): RouteMappingRepository {
  return new RouteMappingRepository(db, logger);
}
