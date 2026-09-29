import {
  missingDailyPartitions,
  PARTITION_MAX,
  partitionBoundary,
  partitionName,
} from "@/common/infrastructure/database/migrations/1783400000000_create-audit-logs-and-system-settings.js"
import {
  AUDIT_LOG_RETENTION_DEFAULT_DAYS,
  formatUtcDateTime,
  truncateTo,
  resolveRetentionDays,
} from "@/modules/audit-log/audit-log.constants.js"
import { describe, expect, it } from "vitest"

describe("audit_logs partition naming", () => {
  it("formats a partition name as pYYYYMMDD", () => {
    expect(partitionName(new Date(Date.UTC(2026, 8, 22)))).toBe("p20260922")
  })

  it("pads single-digit month and day", () => {
    expect(partitionName(new Date(Date.UTC(2026, 0, 5)))).toBe("p20260105")
  })

  it("rolls over correctly at month and year boundaries", () => {
    expect(partitionName(new Date(Date.UTC(2026, 8, 30)))).toBe("p20260930")
    expect(partitionName(new Date(Date.UTC(2026, 9, 1)))).toBe("p20261001")
    expect(partitionName(new Date(Date.UTC(2026, 11, 31)))).toBe("p20261231")
    expect(partitionName(new Date(Date.UTC(2027, 0, 1)))).toBe("p20270101")
  })
})

describe("audit_logs partition boundary", () => {
  it("formats a boundary date as YYYY-MM-DD", () => {
    expect(partitionBoundary(new Date(Date.UTC(2026, 8, 22)))).toBe(
      "2026-09-22"
    )
  })

  it("pads single-digit month and day", () => {
    expect(partitionBoundary(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05")
  })
})

describe("resolveRetentionDays", () => {
  it("passes through a valid value", () => {
    expect(resolveRetentionDays("30")).toBe(30)
    expect(resolveRetentionDays(7)).toBe(7)
  })

  it("falls back to the default when missing or invalid", () => {
    expect(resolveRetentionDays(undefined)).toBe(
      AUDIT_LOG_RETENTION_DEFAULT_DAYS
    )
    expect(resolveRetentionDays(null)).toBe(7)
    expect(resolveRetentionDays("")).toBe(7)
    expect(resolveRetentionDays("abc")).toBe(7)
  })

  it("clamps to 1..90", () => {
    expect(resolveRetentionDays("0")).toBe(1)
    expect(resolveRetentionDays("-5")).toBe(1)
    expect(resolveRetentionDays("91")).toBe(90)
    expect(resolveRetentionDays("100000")).toBe(90)
  })

  it("truncates fractional values", () => {
    expect(resolveRetentionDays("7.9")).toBe(7)
  })
})

describe("missingDailyPartitions", () => {
  const target = new Date(Date.UTC(2026, 8, 30))

  it("creates every missing daily partition up to the target", () => {
    expect(missingDailyPartitions("2026-09-27", target)).toEqual([
      { name: "p20260928", boundary: "2026-09-28" },
      { name: "p20260929", boundary: "2026-09-29" },
      { name: "p20260930", boundary: "2026-09-30" },
    ])
  })

  it("crosses month boundaries", () => {
    expect(
      missingDailyPartitions("2026-09-29", new Date(Date.UTC(2026, 9, 2))).map(
        (p) => p.name
      )
    ).toEqual(["p20260930", "p20261001", "p20261002"])
  })

  it("is idempotent when already covered", () => {
    expect(missingDailyPartitions("2026-09-30", target)).toEqual([])
    expect(missingDailyPartitions("2026-10-15", target)).toEqual([])
  })

  it("creates just the target when there is no daily partition", () => {
    expect(missingDailyPartitions(null, target)).toEqual([
      { name: "p20260930", boundary: "2026-09-30" },
    ])
  })

  it("never yields the catch-all partition", () => {
    expect(
      missingDailyPartitions("2026-09-01", target).some(
        (p) => p.name === PARTITION_MAX
      )
    ).toBe(false)
  })
})

describe("formatUtcDateTime / truncateTo", () => {
  it("formats in UTC", () => {
    expect(formatUtcDateTime(new Date(Date.UTC(2026, 8, 5, 3, 4, 5)))).toBe(
      "2026-09-05 03:04:05"
    )
  })

  it("truncates and passes null through", () => {
    expect(truncateTo("abcdef", 3)).toBe("abc")
    expect(truncateTo(null, 3)).toBeNull()
    expect(truncateTo(undefined, 3)).toBeNull()
  })
})

describe("audit log retention event migration", () => {
  it("defines the procedure and event with the expected names", async () => {
    const m = await import(
      "@/common/infrastructure/database/migrations/1783400000001_create-audit-log-retention-event.js"
    )
    expect(m.CREATE_PROCEDURE_SQL).toContain(
      "CREATE PROCEDURE audit_log_maintain_partitions()"
    )
    expect(m.CREATE_PROCEDURE_SQL).toContain("UTC_DATE()")
    expect(m.CREATE_PROCEDURE_SQL).toContain("REORGANIZE PARTITION pmax")
    expect(m.CREATE_PROCEDURE_SQL).toContain("DROP PARTITION")
    expect(m.CREATE_PROCEDURE_SQL).toContain("audit_log.retention_days")
    expect(m.CREATE_EVENT_SQL).toContain("CREATE EVENT audit_log_retention_daily")
    expect(m.CREATE_EVENT_SQL).toContain("EVERY 1 DAY")
    expect(m.CREATE_EVENT_SQL).toContain("CALL audit_log_maintain_partitions()")
    expect(m.DROP_EVENT_SQL).toContain("DROP EVENT IF EXISTS")
    expect(m.DROP_PROCEDURE_SQL).toContain("DROP PROCEDURE IF EXISTS")
  })
})
