import { describe, it, expect } from "vitest"
import { toMysqlDatetime } from "@/common/utils/date.utils.js"

describe("toMysqlDatetime", () => {
  it("should convert ISO string to MySQL datetime format", () => {
    const result = toMysqlDatetime("2024-03-15T08:30:00.000Z")
    expect(result).toBe("2024-03-15 08:30:00")
  })

  it("should return undefined for undefined input", () => {
    expect(toMysqlDatetime(undefined)).toBeUndefined()
  })

  it("should return undefined for empty string", () => {
    expect(toMysqlDatetime("")).toBeUndefined()
  })

  it("should return original value for invalid date string", () => {
    expect(toMysqlDatetime("not-a-date")).toBe("not-a-date")
  })

  it("should strip milliseconds from result", () => {
    const result = toMysqlDatetime("2024-06-01T23:59:59.999Z")
    expect(result).toBe("2024-06-01 23:59:59")
    expect(result).not.toContain(".")
  })

  it("should not contain T or Z in result", () => {
    const result = toMysqlDatetime("2024-01-01T00:00:00.000Z")
    expect(result).not.toContain("T")
    expect(result).not.toContain("Z")
  })
})
