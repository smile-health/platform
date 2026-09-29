import {
  GetAuditLogsQuerySchema,
  UpdateAuditLogSettingsSchema,
} from "@/modules/audit-log/audit-log.schema.js"
import { describe, expect, it } from "vitest"

describe("UpdateAuditLogSettingsSchema", () => {
  it.each([1, 7, 90])("accepts %i", (retention_days) => {
    expect(
      UpdateAuditLogSettingsSchema.safeParse({ retention_days }).success
    ).toBe(true)
  })

  it.each([0, 91, -1, 1.5, "7", null, undefined])("rejects %p", (v) => {
    expect(
      UpdateAuditLogSettingsSchema.safeParse({ retention_days: v }).success
    ).toBe(false)
  })

  it("rejects a missing body", () => {
    expect(UpdateAuditLogSettingsSchema.safeParse({}).success).toBe(false)
  })
})

describe("GetAuditLogsQuerySchema", () => {
  it("applies pagination defaults", () => {
    const r = GetAuditLogsQuerySchema.parse({})
    expect(r.page).toBe(1)
    expect(r.paginate).toBe(50)
  })

  it("coerces numeric filters and keeps service/action", () => {
    const r = GetAuditLogsQuerySchema.parse({
      program_id: "3",
      actor_id: "9",
      entity_id: "4",
      service: "main",
      action: "export",
    })
    expect(r).toMatchObject({
      program_id: 3,
      actor_id: 9,
      entity_id: 4,
      service: "main",
      action: "export",
    })
  })

  it("rejects non-positive ids", () => {
    expect(GetAuditLogsQuerySchema.safeParse({ actor_id: "0" }).success).toBe(
      false
    )
  })
})

describe("GetAuditLogsQuerySchema date filters", () => {
  it("accepts YYYY-MM-DD and from <= to", () => {
    expect(
      GetAuditLogsQuerySchema.safeParse({
        date_from: "2026-09-01",
        date_to: "2026-09-01",
      }).success
    ).toBe(true)
  })

  it.each(["2026-9-1", "2026-09-01T00:00:00", "yesterday", "20260901"])(
    "rejects malformed date %s",
    (d) => {
      expect(GetAuditLogsQuerySchema.safeParse({ date_from: d }).success).toBe(
        false
      )
      expect(GetAuditLogsQuerySchema.safeParse({ date_to: d }).success).toBe(
        false
      )
    }
  )

  it("rejects date_from after date_to", () => {
    expect(
      GetAuditLogsQuerySchema.safeParse({
        date_from: "2026-09-02",
        date_to: "2026-09-01",
      }).success
    ).toBe(false)
  })
})
