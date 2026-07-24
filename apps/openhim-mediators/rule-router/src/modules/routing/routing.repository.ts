/**
 * Routing Repository — loads integration_routing_rules from DB into in-memory cache.
 */

import type { Kysely } from "kysely";
import type { Logger } from "pino";
import safeRegex from "safe-regex";
import type {
  Database,
  RoutingRuleTable,
} from "../../common/infrastructure/database/connection";
import type { RoutingRule } from "../../common/types/routing";

export class RoutingRepository {
  // topic → non-default rules (ordered by priority asc)
  private cache: Map<string, RoutingRule[]> = new Map();
  // topic → default rules (is_default=true, ordered by priority asc)
  private defaultCache: Map<string, RoutingRule[]> = new Map();
  private cacheLoaded = false;
  private logger: Logger;
  // Change-detection state
  private lastKnownMaxUpdatedAt: string | null = null;
  private lastKnownRowCount: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private db: Kysely<Database>,
    logger: Logger,
  ) {
    this.logger = logger;
  }

  async loadRules(): Promise<void> {
    try {
      this.logger.info("Loading routing rules from database");

      const rows = await this.db
        .selectFrom("integration_routing_rules")
        .selectAll()
        .where("enabled", "=", true)
        .orderBy("priority", "asc")
        .execute();

      this.cache.clear();
      this.defaultCache.clear();

      for (const row of rows) {
        const rule = this.rowToRule(row);

        // Reject regex patterns that could cause catastrophic backtracking (ReDoS).
        // If the DB is compromised and a malicious pattern inserted, this prevents
        // the event loop from hanging. Upgrade to re2 if false-positives become a problem.
        if (rule.filter_operator === "regex" && !safeRegex(rule.filter_value)) {
          this.logger.warn(
            { ruleId: rule.id, topic: rule.topic, pattern: rule.filter_value },
            "Skipping routing rule: regex pattern flagged as potentially unsafe (ReDoS risk). " +
              "Simplify the pattern, or migrate the service to use the re2 engine.",
          );
          continue;
        }

        const target = rule.is_default ? this.defaultCache : this.cache;

        const existing = target.get(rule.topic) ?? [];
        existing.push(rule);
        target.set(rule.topic, existing);
      }

      this.cacheLoaded = true;

      const ruleCount = Array.from(this.cache.values()).reduce(
        (s, a) => s + a.length,
        0,
      );
      const defaultCount = Array.from(this.defaultCache.values()).reduce(
        (s, a) => s + a.length,
        0,
      );

      this.logger.info(
        { ruleCount, defaultCount, topics: Array.from(this.cache.keys()) },
        "Routing rules loaded from database",
      );

      // Record baseline for change detection
      const snapshot = await this.db
        .selectFrom("integration_routing_rules")
        .select((eb) => [
          eb.fn.max("updated_at").as("max_updated_at"),
          eb.fn.count("id").as("row_count"),
        ])
        .executeTakeFirst();
      this.lastKnownMaxUpdatedAt = snapshot?.max_updated_at
        ? String(snapshot.max_updated_at)
        : null;
      this.lastKnownRowCount = Number(snapshot?.row_count ?? 0);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Table")) {
        this.logger.warn(
          { error: error.message },
          "integration_routing_rules table does not exist - skipping load. Run db-scripts/schema.sql.",
        );
        this.cacheLoaded = true;
        return;
      }

      this.logger.error({ error }, "Failed to load routing rules");
      throw error;
    }
  }

  getRulesForTopic(topic: string): RoutingRule[] {
    if (!this.cacheLoaded) {
      this.logger.warn("Cache not loaded, call loadRules() first");
      return [];
    }
    return this.cache.get(topic) ?? [];
  }

  getDefaultRulesForTopic(topic: string): RoutingRule[] {
    if (!this.cacheLoaded) {
      this.logger.warn("Cache not loaded, call loadRules() first");
      return [];
    }
    return this.defaultCache.get(topic) ?? [];
  }

  getAllEnabledRules(): RoutingRule[] {
    const specific = Array.from(this.cache.values()).flat();
    const defaults = Array.from(this.defaultCache.values()).flat();
    return [...specific, ...defaults];
  }

  isLoaded(): boolean {
    return this.cacheLoaded;
  }

  async refresh(): Promise<void> {
    this.logger.debug("Refreshing routing rules cache");
    await this.loadRules();
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
        this.logger.error({ error }, "Routing rules auto-refresh check failed");
      }
    }, intervalMs);

    this.logger.info({ intervalMs }, "Routing rules auto-refresh started");
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
      .selectFrom("integration_routing_rules")
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
        "Routing rule change detected - reloading cache",
      );
      await this.loadRules();
    }
  }

  private rowToRule(row: RoutingRuleTable): RoutingRule {
    return {
      id: row.id,
      topic: row.topic,
      filter_key: row.filter_key,
      filter_operator: row.filter_operator,
      filter_value: row.filter_value,
      target_url: row.target_url,
      target_name: row.target_name,
      is_default: Boolean(row.is_default),
      priority: row.priority,
      enabled: Boolean(row.enabled),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export function createRoutingRepository(
  db: Kysely<Database>,
  logger: Logger,
): RoutingRepository {
  return new RoutingRepository(db, logger);
}
