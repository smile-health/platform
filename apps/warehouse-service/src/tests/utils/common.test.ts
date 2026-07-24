import { describe, expect, it } from "vitest"

import {
  completeMonthSequence,
  generateMonthYearSequence,
  parsingArrIds,
  sliceZeroValueMonths,
  swapKeys,
  toCommaSeparated,
} from "@/common/utils/common.js"

describe("parsingArrIds", () => {
  it("parses a comma-separated string into numbers", () => {
    expect(parsingArrIds("1,2,3")).toEqual([1, 2, 3])
  })

  it("parses an array of strings into numbers", () => {
    expect(parsingArrIds(["4", "5", "6"])).toEqual([4, 5, 6])
  })

  it("trims whitespace around values", () => {
    expect(parsingArrIds(" 1 , 2 , 3 ")).toEqual([1, 2, 3])
  })

  it("filters out non-numeric values", () => {
    expect(parsingArrIds("1,abc,3")).toEqual([1, 3])
  })

  it("converts empty string segment to 0", () => {
    expect(parsingArrIds("")).toEqual([0])
  })
})

describe("sliceZeroValueMonths", () => {
  const nonZero = (item: unknown) => (item as { value: number }).value !== 0

  it("slices off leading zero-value items", () => {
    const list = [{ value: 0 }, { value: 0 }, { value: 5 }, { value: 3 }]
    expect(sliceZeroValueMonths(list, nonZero)).toEqual([
      { value: 5 },
      { value: 3 },
    ])
  })

  it("returns the full list when the first item is non-zero", () => {
    const list = [{ value: 1 }, { value: 0 }, { value: 2 }]
    expect(sliceZeroValueMonths(list, nonZero)).toEqual(list)
  })

  it("returns empty array when all items are zero", () => {
    const list = [{ value: 0 }, { value: 0 }]
    expect(sliceZeroValueMonths(list, nonZero)).toEqual([])
  })

  it("returns empty array for an empty list", () => {
    expect(sliceZeroValueMonths([], nonZero)).toEqual([])
  })
})

describe("generateMonthYearSequence", () => {
  it("returns a single entry when start and end are the same month", () => {
    expect(generateMonthYearSequence("2024-03-01", "2024-03-31")).toEqual([
      "2024-3",
    ])
  })

  it("generates a sequence across multiple months", () => {
    expect(generateMonthYearSequence("2024-01-01", "2024-03-01")).toEqual([
      "2024-1",
      "2024-2",
      "2024-3",
    ])
  })

  it("crosses year boundaries correctly", () => {
    expect(generateMonthYearSequence("2023-11-01", "2024-02-01")).toEqual([
      "2023-11",
      "2023-12",
      "2024-1",
      "2024-2",
    ])
  })
})

describe("swapKeys", () => {
  it("swaps the positions of two keys in an object", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = swapKeys(obj, "a", "b")
    const keys = Object.keys(result)
    expect(keys[0]).toBe("b")
    expect(keys[1]).toBe("a")
    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
  })

  it("throws when a key does not exist", () => {
    const obj = { a: 1, b: 2 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => swapKeys(obj as any, "a", "z" as any)).toThrow("Key not found")
  })
})

describe("completeMonthSequence", () => {
  it("fills missing months with value 0", () => {
    const source = [{ year: "2024", month: "3", value: 10 }]
    const result = completeMonthSequence(source, ["2024-1", "2024-2", "2024-3"])
    expect(result[0]!.value).toBe(0)
    expect(result[1]!.value).toBe(0)
    expect(result[2]!.value).toBe(10)
  })

  it("uses Indonesian month labels", () => {
    const result = completeMonthSequence([], ["2024-1", "2024-6", "2024-12"])
    expect(result[0]!.month).toBe("Januari")
    expect(result[1]!.month).toBe("Juni")
    expect(result[2]!.month).toBe("Desember")
  })

  it("returns correct year in each entry", () => {
    const result = completeMonthSequence([], ["2023-11", "2024-1"])
    expect(result[0]!.year).toBe("2023")
    expect(result[1]!.year).toBe("2024")
  })
})

describe("toCommaSeparated", () => {
  it("joins items by name with comma-space separator", () => {
    const data = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ]
    expect(toCommaSeparated(data)).toBe("Alpha, Beta")
  })

  it("returns undefined for an empty array", () => {
    expect(toCommaSeparated([])).toBeUndefined()
  })

  it("applies a custom map function", () => {
    const data = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ]
    expect(toCommaSeparated(data, (item) => item.id)).toBe("1, 2")
  })
})
