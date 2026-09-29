import { toUtcIso } from "@/modules/audit-log/audit-log.module.js"
import {
  localDayStartToUtc,
  resolveTimezone,
} from "@/modules/audit-log/audit-log.repository.js"
import { describe, expect, it } from "vitest"

describe("audit log timezone conversion", () => {
  it("converts Asia/Jakarta date_from to UTC start", () => {
    expect(localDayStartToUtc("2026-09-29", "Asia/Jakarta")).toBe(
      "2026-09-28 17:00:00"
    )
  })

  it("converts Asia/Jakarta date_to to exclusive next-day UTC start", () => {
    expect(localDayStartToUtc("2026-09-29", "Asia/Jakarta", 1)).toBe(
      "2026-09-29 17:00:00"
    )
  })

  it("handles zones ahead of and behind UTC", () => {
    expect(localDayStartToUtc("2026-09-29", "America/New_York")).toBe(
      "2026-09-29 04:00:00"
    )
  })

  it.each([undefined, null, "", "Mars/Olympus", "not a zone"])(
    "falls back to UTC for %p",
    (tz) => {
      expect(resolveTimezone(tz)).toBe("UTC")
      expect(localDayStartToUtc("2026-09-29", tz)).toBe("2026-09-29 00:00:00")
    }
  )

  it("keeps a valid zone", () => {
    expect(resolveTimezone("Asia/Jakarta")).toBe("Asia/Jakarta")
  })
})

describe("toUtcIso", () => {
  it("formats a Date as ISO with Z", () => {
    expect(toUtcIso(new Date("2026-09-29T01:02:03Z"))).toBe(
      "2026-09-29T01:02:03.000Z"
    )
  })

  it("treats a naive datetime string as UTC", () => {
    expect(toUtcIso("2026-09-29 01:02:03")).toBe("2026-09-29T01:02:03Z")
  })
})
