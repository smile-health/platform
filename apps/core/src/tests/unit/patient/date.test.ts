import { describe, expect, it } from "vitest"
import { normalizeToYMD } from "@/modules/patient/utils/date.js"

describe("normalizeToYMD", () => {
  it("formats a Date object to YYYY-MM-DD", () => {
    expect(normalizeToYMD(new Date(2024, 5, 15))).toBe("2024-06-15")
  })

  it("zero-pads single-digit month", () => {
    expect(normalizeToYMD(new Date(2024, 0, 5))).toBe("2024-01-05")
  })

  it("zero-pads single-digit day", () => {
    expect(normalizeToYMD(new Date(2024, 2, 1))).toBe("2024-03-01")
  })

  it("parses a YYYY-MM-DD string and returns the same format", () => {
    expect(normalizeToYMD("2024-03-15")).toBe("2024-03-15")
  })

  it("parses an ISO string and returns a YYYY-MM-DD formatted string", () => {
    const result = normalizeToYMD("2024-07-20T00:00:00.000Z")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("returns the original string unchanged when the input is not a valid date", () => {
    expect(normalizeToYMD("not-a-date")).toBe("not-a-date")
  })

  it("returns the original string for an empty string", () => {
    expect(normalizeToYMD("")).toBe("")
  })
})
