import { describe, it, expect } from "vitest"
import { sanitizeStockUpdateValues } from "@/common/utils/stock-sanitizer.utils.js"

describe("sanitizeStockUpdateValues", () => {
  it("should clamp negative allocated_qty to 0", () => {
    expect(sanitizeStockUpdateValues({ allocated_qty: -5 })).toEqual({ allocated_qty: 0 })
  })

  it("should preserve positive allocated_qty", () => {
    expect(sanitizeStockUpdateValues({ allocated_qty: 10 })).toEqual({ allocated_qty: 10 })
  })

  it("should preserve null allocated_qty", () => {
    expect(sanitizeStockUpdateValues({ allocated_qty: null })).toEqual({ allocated_qty: null })
  })

  it("should preserve undefined allocated_qty", () => {
    expect(sanitizeStockUpdateValues({ allocated_qty: undefined })).toEqual({ allocated_qty: undefined })
  })

  it("should clamp negative unreceived_qty to 0", () => {
    expect(sanitizeStockUpdateValues({ unreceived_qty: -1 })).toEqual({ unreceived_qty: 0 })
  })

  it("should preserve positive unreceived_qty", () => {
    expect(sanitizeStockUpdateValues({ unreceived_qty: 3 })).toEqual({ unreceived_qty: 3 })
  })

  it("should clamp negative in_transit_qty to 0", () => {
    expect(sanitizeStockUpdateValues({ in_transit_qty: -100 })).toEqual({ in_transit_qty: 0 })
  })

  it("should preserve positive in_transit_qty", () => {
    expect(sanitizeStockUpdateValues({ in_transit_qty: 7 })).toEqual({ in_transit_qty: 7 })
  })

  it("should not add stock fields that are absent from input", () => {
    const result = sanitizeStockUpdateValues({ id: 1, name: "item" })
    expect(result).toEqual({ id: 1, name: "item" })
    expect(result).not.toHaveProperty("allocated_qty")
  })

  it("should preserve non-stock fields unchanged", () => {
    const result = sanitizeStockUpdateValues({ id: 42, allocated_qty: -3, name: "x" })
    expect(result.id).toBe(42)
    expect(result.name).toBe("x")
    expect(result.allocated_qty).toBe(0)
  })

  it("should sanitize all three fields together", () => {
    expect(
      sanitizeStockUpdateValues({ allocated_qty: -1, unreceived_qty: -2, in_transit_qty: -3 })
    ).toEqual({ allocated_qty: 0, unreceived_qty: 0, in_transit_qty: 0 })
  })
})
