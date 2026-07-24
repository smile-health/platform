import { describe, expect, it } from "vitest"

import { calculatePagination } from "@/common/utils/pagination.js"

describe("calculatePagination", () => {
  it("returns correct metadata for a typical case", () => {
    const result = calculatePagination(100, 1, 10)
    expect(result.page).toBe(1)
    expect(result.item_per_page).toBe(10)
    expect(result.total_item).toBe(100)
    expect(result.total_page).toBe(10)
  })

  it("rounds up total_page when items don't divide evenly", () => {
    const result = calculatePagination(25, 1, 10)
    expect(result.total_page).toBe(3)
  })

  it("returns total_page of 0 when total is 0", () => {
    const result = calculatePagination(0, 1, 10)
    expect(result.total_page).toBe(0)
    expect(result.total_item).toBe(0)
  })

  it("always returns the fixed list_pagination options", () => {
    const result = calculatePagination(50, 2, 25)
    expect(result.list_pagination).toEqual([10, 25, 50, 100])
  })

  it("reflects the requested page number", () => {
    const result = calculatePagination(200, 5, 50)
    expect(result.page).toBe(5)
    expect(result.total_page).toBe(4)
  })
})
