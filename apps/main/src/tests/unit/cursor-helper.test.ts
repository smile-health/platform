import { describe, it, expect } from "vitest"
import { CursorUtils, CursorPaginatedResponse } from "@/modules/helpers/cursor-helper.js"

describe("CursorUtils.encodeCursor / decodeCursor", () => {
  it("should round-trip encode and decode a cursor object", () => {
    const original = { id: 1, value: "test", nested: { n: 2 } }
    const encoded = CursorUtils.encodeCursor(original)
    const decoded = CursorUtils.decodeCursor(encoded)
    expect(decoded).toEqual(original)
  })

  it("should produce a base64 string", () => {
    const encoded = CursorUtils.encodeCursor({ id: 1 })
    expect(typeof encoded).toBe("string")
    expect(() => Buffer.from(encoded, "base64")).not.toThrow()
  })

  it("should throw for invalid cursor string", () => {
    expect(() => CursorUtils.decodeCursor("!!not-base64-json!!")).toThrow("Invalid cursor format")
  })

  it("should throw for valid base64 that is not JSON", () => {
    const notJson = Buffer.from("not json at all").toString("base64")
    expect(() => CursorUtils.decodeCursor(notJson)).toThrow("Invalid cursor format")
  })
})

describe("CursorPaginatedResponse", () => {
  it("should assign all constructor fields", () => {
    const req = { paginate: 10, cursor: "abc" }
    const data = [{ id: 1 }, { id: 2 }]
    const res = new CursorPaginatedResponse(req, data, true, false, "next123", "prev456", 99)

    expect(res.paginate).toBe(10)
    expect(res.data).toEqual(data)
    expect(res.has_next_page).toBe(true)
    expect(res.has_previous_page).toBe(false)
    expect(res.next_cursor).toBe("next123")
    expect(res.previous_cursor).toBe("prev456")
    expect(res.total_count).toBe(99)
  })

  it("should use default values when optional fields are omitted", () => {
    const res = new CursorPaginatedResponse({ paginate: 5 })
    expect(res.data).toEqual([])
    expect(res.has_next_page).toBe(false)
    expect(res.has_previous_page).toBe(false)
    expect(res.next_cursor).toBeUndefined()
    expect(res.previous_cursor).toBeUndefined()
    expect(res.total_count).toBeUndefined()
  })
})
