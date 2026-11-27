import {
  generateDummy,
  type DummyInput,
} from "@/common/infrastructure/database/seed-data/immunization-program/dummy.js"
import { resolveIds } from "@/common/infrastructure/database/seed-data/immunization-program/id-resolver.js"
import { buildSeedUsers } from "@/common/infrastructure/database/seed-data/immunization-program/users.js"
import { describe, expect, it } from "vitest"

const BASE = 1_960_000_000

function input(overrides: Partial<DummyInput> = {}): DummyInput {
  const nodes: DummyInput["nodes"] = [
    { ew: 1, level: "kemenkes", parentEw: null },
    { ew: 10, level: "provinsi", parentEw: 1 },
    { ew: 11, level: "provinsi", parentEw: 1 },
    { ew: 20, level: "kabkota", parentEw: 10 },
    { ew: 30, level: "puskesmas", parentEw: 20 },
    { ew: 31, level: "puskesmas", parentEw: 20 },
    { ew: 40, level: "lastmile", parentEw: 30 },
  ]
  return {
    nodes,
    materials: [
      { mw: 500, parentMw: 400, name: "BCG", perPack: 20, manufacturers: [7] },
      {
        mw: 501,
        parentMw: null,
        name: "ADS 0.05 ml",
        perPack: 1,
        manufacturers: [],
      },
    ],
    profile: [
      { ew: 30, mw: 500, activityId: 26, monthlyOut: 0, monthlyCons: 400 },
      { ew: 31, mw: 501, activityId: 26, monthlyOut: 0, monthlyCons: 150 },
      { ew: 20, mw: 500, activityId: 26, monthlyOut: 3000, monthlyCons: 0 },
      { ew: 11, mw: 500, activityId: 26, monthlyOut: 9000, monthlyCons: 0 },
      { ew: 30, mw: 500, activityId: 27, monthlyOut: 0, monthlyCons: 200 },
    ],
    activities: [
      { id: 26, code: "rutin", materialLimit: 5, activeMonths: [] },
      { id: 27, code: "bias", materialLimit: 5, activeMonths: [7, 8, 10] },
    ],
    entityActivityIds: new Map([["30|26", 77]]),
    entityMaterialActivities: new Set(["30|500|26"]),
    customerVendors: new Set(["10|1"]),
    programId: 7,
    ids: {
      txType: {
        stockCount: 1,
        out: 2,
        in: 3,
        discard: 4,
        addStock: 7,
        consumption: 9,
      },
      orderStatus: {
        pending: 1,
        confirmed: 2,
        allocated: 3,
        shipped: 4,
        fulfilled: 5,
      },
      orderType: { request: 1, distribution: 2 },
      addStockReason: 14,
      discardReasons: [3, 4, 5],
      budgetSourceCentral: 1,
      stockQuality: 1,
      orderStockStatus: 1,
      fallbackManufacturer: 99,
    },
    userId: 1626,
    start: new Date("2025-12-01T00:00:00Z"),
    end: new Date("2026-11-27T00:00:00Z"),
    seed: 960,
    idBase: BASE,
    ...overrides,
  }
}

describe("immunization dummy generator", () => {
  const out = generateDummy(input())
  const stockById = new Map(out.stocks.map((s) => [s.id as number, s]))
  const parentOf = new Map(input().nodes.map((n) => [n.ew, n.parentEw]))

  it("produces data for every simulated table", () => {
    expect(out.summary.activities).toBe(2)
    expect(out.batches.length).toBeGreaterThan(0)
    expect(out.orders.length).toBeGreaterThan(20)
    expect(out.transactions.length).toBeGreaterThan(200)
  })

  it("keeps every stock row equal to the sum of its transactions", () => {
    const sums = new Map<number, number>()
    for (const t of out.transactions)
      sums.set(
        t.stock_id as number,
        (sums.get(t.stock_id as number) ?? 0) + (t.change_qty as number)
      )
    for (const s of out.stocks)
      expect(s.qty).toBe(sums.get(s.id as number) ?? 0)
  })

  it("chains opening_qty to the running balance and never goes negative", () => {
    const balance = new Map<number, number>()
    for (const t of out.transactions) {
      const stock = t.stock_id as number
      const before = balance.get(stock) ?? 0
      expect(t.opening_qty).toBe(before)
      const after = before + (t.change_qty as number)
      expect(after).toBeGreaterThanOrEqual(0)
      balance.set(stock, after)
    }
  })

  it("moves goods only from parent to child", () => {
    for (const o of out.orders)
      expect(parentOf.get(o.customer_id as number)).toBe(o.vendor_id)
    for (const t of out.transactions) {
      if (t.transaction_type_id === 2)
        expect(parentOf.get(t.companion_entity_id as number)).toBe(t.entity_id)
      if (t.transaction_type_id === 3)
        expect(parentOf.get(t.entity_id as number)).toBe(t.companion_entity_id)
      if (t.transaction_type_id === 9 && t.companion_entity_id !== null)
        expect(parentOf.get(t.companion_entity_id as number)).toBe(t.entity_id)
    }
  })

  it("balances shipped and received quantities per fulfilled order", () => {
    for (const o of out.orders.filter((x) => x.order_status_id === 5)) {
      const txs = out.transactions.filter((t) => t.order_id === o.id)
      const shipped = txs
        .filter((t) => t.transaction_type_id === 2)
        .reduce((s, t) => s - (t.change_qty as number), 0)
      const received = txs
        .filter((t) => t.transaction_type_id === 3)
        .reduce((s, t) => s + (t.change_qty as number), 0)
      const items = out.orderItems
        .filter((i) => i.order_id === o.id)
        .reduce((s, i) => s + (i.received_qty as number), 0)
      expect(shipped).toBeGreaterThan(0)
      expect(received).toBe(shipped)
      expect(items).toBe(shipped)
    }
  })

  it("leaves some orders in progress at the end of the window", () => {
    expect(out.orders.some((o) => o.order_status_id !== 5)).toBe(true)
    for (const o of out.orders.filter((x) => x.order_status_id === 4)) {
      const shipped = out.transactions.filter(
        (t) => t.order_id === o.id && t.transaction_type_id === 2
      )
      expect(shipped.length).toBeGreaterThan(0)
      expect(
        out.transactions.some(
          (t) => t.order_id === o.id && t.transaction_type_id === 3
        )
      ).toBe(false)
    }
  })

  it("tracks in-transit quantities of shipped orders on the stock rows", () => {
    const inTransit = out.stocks.reduce(
      (s, x) => s + (x.in_transit_qty as number),
      0
    )
    const unreceived = out.stocks.reduce(
      (s, x) => s + (x.unreceived_qty as number),
      0
    )
    expect(inTransit).toBe(unreceived)
    for (const s of out.stocks) {
      expect(s.allocated_qty as number).toBeLessThanOrEqual(s.qty as number)
    }
  })

  it("only consumes at puskesmas and keeps BIAS consumption in BIAS months", () => {
    for (const t of out.transactions.filter(
      (x) => x.transaction_type_id === 9
    )) {
      expect([30, 31]).toContain(t.entity_id)
      if (t.activity_id === 27)
        expect([7, 8, 10]).toContain((t.created_at as Date).getUTCMonth())
    }
  })

  it("uses the reserved id range, unique ids and existing reference rows", () => {
    const tables = [
      out.batches,
      out.stocks,
      out.orders,
      out.orderItems,
      out.orderHistories,
      out.transactions,
      out.entityActivities,
      out.entityMaterialActivities,
      out.customerVendors,
    ]
    for (const rows of tables) {
      const ids = rows.map((r) => r.id as number)
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) expect(id).toBeGreaterThan(BASE)
    }
    expect(
      out.transactions
        .filter((t) => t.entity_id === 30 && t.activity_id === 26)
        .every((t) => t.entity_activity_id === 77)
    ).toBe(true)
    expect(
      out.entityMaterialActivities.some(
        (r) =>
          r.entity_id === 30 && r.material_id === 500 && r.activity_id === 26
      )
    ).toBe(false)
    expect(
      out.customerVendors.some((r) => r.customer_id === 10 && r.vendor_id === 1)
    ).toBe(false)
    expect(new Set(out.transactions.map((t) => t.uuid)).size).toBe(
      out.transactions.length
    )
    for (const s of out.stocks)
      expect(stockById.get(s.id as number)).toBeDefined()
  })

  it("is deterministic for the same seed", () => {
    const again = generateDummy(input())
    expect(again.summary).toEqual(out.summary)
    expect(again.transactions.slice(0, 50)).toEqual(
      out.transactions.slice(0, 50)
    )
  })
})

describe("resolveIds", () => {
  const rows = [
    { id: 1, key: "a" },
    { id: 2, key: "b" },
    { id: 3, key: "c" },
  ]
  it("reuses natural keys, keeps free ids and shifts taken ids", () => {
    const map = resolveIds(rows, {
      id: (r) => r.id,
      key: (r) => r.key,
      existingById: new Map([
        [2, "x"],
        [9, "a"],
      ]),
      existingByKey: new Map([["a", 9]]),
      offset: 100,
    })
    expect(map.get(1)).toEqual({ id: 9, exists: true })
    expect(map.get(2)).toEqual({ id: 102, exists: false })
    expect(map.get(3)).toEqual({ id: 3, exists: false })
  })
  it("refuses to overwrite a different row", () => {
    expect(() =>
      resolveIds([{ id: 2, key: "b" }], {
        id: (r) => r.id,
        key: (r) => r.key,
        existingById: new Map([
          [2, "x"],
          [102, "y"],
        ]),
        existingByKey: new Map(),
        offset: 100,
      })
    ).toThrow(/taken/)
  })
})

describe("buildSeedUsers", () => {
  const users = buildSeedUsers([
    { entityId: 8763, level: "kemenkes", name: "KEMENKES RI" },
    { entityId: 10259, level: "provinsi", name: "DINKES PROV. JAWA TIMUR" },
    { entityId: 5, level: "kabkota", name: "DINKES KAB. BOGOR" },
    { entityId: 23, level: "kabkota", name: "DINKES KOTA BANDUNG" },
    { entityId: 11627, level: "puskesmas", name: "PUSKESMAS KEMANG" },
    { entityId: 99, level: "puskesmas", name: "Puskesmas  Kemang" },
    {
      entityId: 21995,
      level: "lastmile",
      name: "PUSKESMAS WARUROYOM DALAM GEDUNG",
    },
  ])

  it("creates one prefixed account per stock-holding entity", () => {
    expect(users.map((u) => u.username)).toEqual([
      "imun_kemenkes",
      "imun_prov_jawa_timur",
      "imun_kab_bogor",
      "imun_kota_bandung",
      "imun_pkm_kemang",
      "imun_pkm_kemang_99",
    ])
  })

  it("maps roles by level and links the entity", () => {
    expect(users.map((u) => u.roleName)).toEqual([
      "Admin",
      "Manager",
      "Manager",
      "Manager",
      "Operator",
      "Operator",
    ])
    expect(users[4]).toMatchObject({
      entityId: 11627,
      email: "imun_pkm_kemang@example.com",
      lastname: "PUSKESMAS KEMANG",
    })
    for (const u of users) expect(u.username).toMatch(/^imun_[a-z0-9_]+$/)
  })
})
