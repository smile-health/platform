import { describe, it, expect } from "vitest"
import { createCountMap, createCountRecord } from "@/common/utils/target.utils.js"

describe("createCountMap", () => {
  it("should build a Map from valid rows", () => {
    const result = createCountMap([
      { target_group_id: 1, count: 10 },
      { target_group_id: 2, count: 20 },
    ])
    expect(result.get(1)).toBe(10)
    expect(result.get(2)).toBe(20)
    expect(result.size).toBe(2)
  })

  it("should coerce bigint count to number", () => {
    const result = createCountMap([{ target_group_id: 1, count: BigInt(999) }])
    expect(result.get(1)).toBe(999)
    expect(typeof result.get(1)).toBe("number")
  })

  it("should skip rows with null target_group_id", () => {
    const result = createCountMap([{ target_group_id: null, count: 5 }])
    expect(result.size).toBe(0)
  })

  it("should skip rows with undefined target_group_id", () => {
    const result = createCountMap([{ target_group_id: undefined, count: 5 }])
    expect(result.size).toBe(0)
  })

  it("should return empty Map for empty input", () => {
    expect(createCountMap([])).toEqual(new Map())
  })
})

describe("createCountRecord", () => {
  it("should build a Record from valid rows", () => {
    const result = createCountRecord([
      { target_group_id: 1, count: 10 },
      { target_group_id: 2, count: 20 },
    ])
    expect(result[1]).toBe(10)
    expect(result[2]).toBe(20)
  })

  it("should coerce bigint count to number", () => {
    const result = createCountRecord([{ target_group_id: 3, count: BigInt(42) }])
    expect(result[3]).toBe(42)
    expect(typeof result[3]).toBe("number")
  })

  it("should skip rows with null target_group_id", () => {
    const result = createCountRecord([{ target_group_id: null, count: 5 }])
    expect(Object.keys(result)).toHaveLength(0)
  })

  it("should skip rows with undefined target_group_id", () => {
    const result = createCountRecord([{ target_group_id: undefined, count: 5 }])
    expect(Object.keys(result)).toHaveLength(0)
  })

  it("should return empty Record for empty input", () => {
    expect(createCountRecord([])).toEqual({})
  })
})
