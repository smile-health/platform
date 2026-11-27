import { createRng, type Rng } from "./rng.js"

/**
 * Dummy transactional data for the immunization program: batches, stocks,
 * orders (with items and status history) and stock transactions.
 *
 * The generator is a day-by-day simulation over the supply chain
 * Kemenkes -> provinsi -> kab/kota -> puskesmas (-> lastmile as consumption
 * companion), so every stock row equals the sum of its transactions and every
 * order moves goods only along the hierarchy. Pure function: no DB access.
 */

export type Level =
  "kemenkes" | "provinsi" | "kabkota" | "puskesmas" | "lastmile"

export interface DummyNode {
  ew: number
  level: Level
  parentEw: number | null
}

export interface DummyMaterial {
  mw: number
  parentMw: number | null
  name: string
  /** consumption units per distribution unit (e.g. 10 doses per vial) */
  perPack: number
  /** manufacture_workspaces ids that can supply this material */
  manufacturers: number[]
}

export interface DummyProfile {
  ew: number
  mw: number
  activityId: number
  monthlyOut: number
  monthlyCons: number
}

export interface DummyIds {
  txType: {
    stockCount: number
    out: number
    in: number
    discard: number
    addStock: number
    consumption: number
  }
  orderStatus: {
    pending: number
    confirmed: number
    allocated: number
    shipped: number
    fulfilled: number
  }
  orderType: { request: number; distribution: number }
  addStockReason: number | null
  discardReasons: number[]
  budgetSourceCentral: number | null
  stockQuality: number | null
  orderStockStatus: number | null
  fallbackManufacturer: number
}

export interface DummyActivity {
  id: number
  code: string | null
  /** number of materials simulated for this activity */
  materialLimit: number
  /** months (0-11, Jan = 0) in which consumption happens; empty = every month */
  activeMonths: number[]
}

export interface DummyInput {
  nodes: DummyNode[]
  materials: DummyMaterial[]
  profile: DummyProfile[]
  activities: DummyActivity[]
  /** `${ew}|${activityId}` -> ws_entity_activities.id already present */
  entityActivityIds: Map<string, number>
  /** `${ew}|${mw}|${activityId}` already present in ws_entity_material_activities */
  entityMaterialActivities: Set<string>
  /** `${customerEw}|${vendorEw}` already present in ws_customer_vendors */
  customerVendors: Set<string>
  programId: number
  ids: DummyIds
  userId: number
  start: Date
  end: Date
  seed: number
  idBase: number
}

type Row = Record<string, unknown>

export interface DummyOutput {
  batches: Row[]
  stocks: Row[]
  orders: Row[]
  orderItems: Row[]
  orderHistories: Row[]
  transactions: Row[]
  entityActivities: Row[]
  entityMaterialActivities: Row[]
  customerVendors: Row[]
  customerVendorActivities: Row[]
  summary: Record<string, number>
}

const DAY = 86_400_000
const COVER_MONTHS: Record<Level, number> = {
  kemenkes: 3,
  provinsi: 2.5,
  kabkota: 2,
  puskesmas: 1.5,
  lastmile: 0,
}

interface Stock {
  row: Row
  ew: number
  mw: number
  activityId: number
  batch: Batch
  qty: number
  allocated: number
  inTransit: number
  unreceived: number
}

interface Batch {
  id: number
  code: string
  manufacturer: number
  expiry: Date
  row: Row
}

interface PendingOrder {
  order: Row
  vendorEw: number
  customerEw: number
  activityId: number
  lines: { mw: number; qty: number }[]
  allocations: { stock: Stock; qty: number; item: Row }[]
  schedule: { status: keyof DummyIds["orderStatus"]; at: Date }[]
  done: number
}

const roundUp = (qty: number, pack: number) => Math.ceil(qty / pack) * pack
const key = (...parts: (number | string)[]) => parts.join("|")

function workTime(rng: Rng, day: Date): Date {
  // 08:00-15:59 WIB == 01:00-08:59 UTC
  return new Date(
    day.getTime() +
      rng.int(1, 8) * 3_600_000 +
      rng.int(0, 59) * 60_000 +
      rng.int(0, 59) * 1000
  )
}

function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export function generateDummy(input: DummyInput): DummyOutput {
  const rng = createRng(input.seed)
  const { ids } = input
  const counters = new Map<string, number>()
  const nextId = (table: string) => {
    const n = (counters.get(table) ?? 0) + 1
    counters.set(table, n)
    return input.idBase + n
  }

  const out: DummyOutput = {
    batches: [],
    stocks: [],
    orders: [],
    orderItems: [],
    orderHistories: [],
    transactions: [],
    entityActivities: [],
    entityMaterialActivities: [],
    customerVendors: [],
    customerVendorActivities: [],
    summary: {},
  }

  const nodeByEw = new Map(input.nodes.map((n) => [n.ew, n]))
  const children = new Map<number, DummyNode[]>()
  for (const n of input.nodes) {
    if (n.parentEw === null) continue
    if (!nodeByEw.has(n.parentEw))
      throw new Error(`node ${n.ew} has unknown parent ${n.parentEw}`)
    children.set(n.parentEw, [...(children.get(n.parentEw) ?? []), n])
  }
  const holders = input.nodes.filter((n) => n.level !== "lastmile")
  const pkms = holders.filter((n) => n.level === "puskesmas")
  const materialByMw = new Map(input.materials.map((m) => [m.mw, m]))

  // ---------- choose materials per activity and derive monthly demand ----------
  const profileByKey = new Map(
    input.profile.map((p) => [key(p.ew, p.mw, p.activityId), p])
  )
  const plan: { activity: DummyActivity; materials: DummyMaterial[] }[] = []
  for (const activity of input.activities) {
    const volume = new Map<number, number>()
    for (const p of input.profile) {
      if (p.activityId !== activity.id || !materialByMw.has(p.mw)) continue
      volume.set(p.mw, (volume.get(p.mw) ?? 0) + p.monthlyOut + p.monthlyCons)
    }
    const chosen = [...volume.entries()]
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, activity.materialLimit)
      .map(([mw]) => materialByMw.get(mw) as DummyMaterial)
    if (chosen.length) plan.push({ activity, materials: chosen })
  }

  /** monthly consumption per puskesmas, `${ew}|${mw}|${act}` */
  const consumption = new Map<string, number>()
  for (const { activity, materials } of plan) {
    for (const m of materials) {
      const known = pkms
        .map(
          (p) =>
            profileByKey.get(key(p.ew, m.mw, activity.id))?.monthlyCons ?? 0
        )
        .filter((v) => v > 0)
        .sort((a, b) => a - b)
      const p90 = known.length
        ? (known[Math.floor(known.length * 0.9)] ?? known[known.length - 1]!)
        : 0
      const median = known.length ? known[Math.floor(known.length / 2)]! : 0
      let fallback = median
      if (!fallback) {
        const upstream = input.profile.filter(
          (p) =>
            p.mw === m.mw &&
            p.activityId === activity.id &&
            nodeByEw.get(p.ew)?.level === "kabkota"
        )
        const kabOut =
          upstream.reduce((s, p) => s + p.monthlyOut, 0) /
          Math.max(upstream.length, 1)
        fallback = kabOut / 25
      }
      fallback = Math.max(fallback, m.perPack * 2)
      for (const p of pkms) {
        const own =
          profileByKey.get(key(p.ew, m.mw, activity.id))?.monthlyCons ?? 0
        const base =
          own > 0
            ? Math.min(own, p90 * 2 || own)
            : fallback * rng.float(0.6, 1.4)
        consumption.set(
          key(p.ew, m.mw, activity.id),
          Math.max(1, Math.round(base))
        )
      }
    }
  }

  /** monthly outflow a holder must cover (own consumption or downstream demand) */
  const needCache = new Map<string, number>()
  const monthlyNeed = (ew: number, mw: number, act: number): number => {
    const k = key(ew, mw, act)
    const cached = needCache.get(k)
    if (cached !== undefined) return cached
    const node = nodeByEw.get(ew)!
    let need = 0
    const holderChildren = (children.get(ew) ?? []).filter(
      (c) => c.level !== "lastmile"
    )
    if (node.level === "puskesmas") need = consumption.get(k) ?? 0
    else if (holderChildren.length)
      for (const c of holderChildren) need += monthlyNeed(c.ew, mw, act)
    else {
      // office whose own children are outside the seeded chain: keep a small buffer sized
      // from its real distribution volume so it still has stock to show
      const own = profileByKey.get(k)?.monthlyOut ?? 0
      need = own > 0 ? Math.max(1, Math.round(own * 0.05)) : 0
    }
    needCache.set(k, need)
    return need
  }
  const target = (n: DummyNode, mw: number, act: number) =>
    monthlyNeed(n.ew, mw, act) * COVER_MONTHS[n.level]

  // ---------- reference rows: entity activities, material relations, customer-vendors ----------
  const entityActivityId = (ew: number, act: number): number => {
    const k = key(ew, act)
    let id = input.entityActivityIds.get(k)
    if (id === undefined) {
      id = nextId("ws_entity_activities")
      input.entityActivityIds.set(k, id)
      out.entityActivities.push({
        id,
        entity_id: ew,
        activity_id: act,
        start_date: new Date(Date.UTC(input.start.getUTCFullYear(), 0, 1)),
        end_date: null,
      })
    }
    return id
  }
  const ensureEma = (ew: number, mw: number, act: number) => {
    const k = key(ew, mw, act)
    if (input.entityMaterialActivities.has(k)) return
    input.entityMaterialActivities.add(k)
    const node = nodeByEw.get(ew)!
    const need = monthlyNeed(ew, mw, act)
    out.entityMaterialActivities.push({
      id: nextId("ws_entity_material_activities"),
      entity_id: ew,
      material_id: mw,
      activity_id: act,
      min: Math.round(need * 0.5),
      max: Math.round(need * (COVER_MONTHS[node.level] + 1)),
      consumption_rate: null,
      retailer_price: null,
      tax: null,
      created_by: input.userId,
      updated_by: input.userId,
    })
  }
  for (const n of input.nodes) {
    if (n.parentEw === null) continue
    const k = key(n.ew, n.parentEw)
    if (input.customerVendors.has(k)) continue
    input.customerVendors.add(k)
    const id = nextId("ws_customer_vendors")
    out.customerVendors.push({
      id,
      program_id: input.programId,
      customer_id: n.ew,
      vendor_id: n.parentEw,
      is_distribution: n.level === "lastmile" ? 0 : 1,
      is_consumption: n.level === "lastmile" ? 1 : 0,
      is_extermination: 0,
    })
    for (const { activity } of plan)
      out.customerVendorActivities.push({
        id: nextId("ws_customer_vendor_activities"),
        customer_vendor_id: id,
        activity_id: activity.id,
      })
  }

  // ---------- stocks, batches, transactions ----------
  const stocks = new Map<string, Stock>()
  const batchesByMaterial = new Map<number, Batch[]>()
  let batchSeq = 0

  const newBatch = (
    m: DummyMaterial,
    at: Date,
    minMonths: number,
    maxMonths: number
  ): Batch => {
    batchSeq += 1
    const manufacturer = m.manufacturers.length
      ? rng.pick(m.manufacturers)
      : ids.fallbackManufacturer
    const yymm = `${String(at.getUTCFullYear()).slice(2)}${String(at.getUTCMonth() + 1).padStart(2, "0")}`
    const code = `IMN${yymm}${String(batchSeq).padStart(4, "0")}`
    const expiry = new Date(
      dateOnly(at).getTime() + rng.int(minMonths * 30, maxMonths * 30) * DAY
    )
    const id = nextId("ws_batches")
    const row: Row = {
      id,
      manufacture_id: manufacturer,
      code,
      production_date: new Date(
        dateOnly(at).getTime() - rng.int(60, 180) * DAY
      ),
      expired_date: expiry,
      status: 1,
      material_id: m.mw,
    }
    out.batches.push(row)
    const batch = { id, code, manufacturer, expiry, row }
    batchesByMaterial.set(m.mw, [...(batchesByMaterial.get(m.mw) ?? []), batch])
    return batch
  }

  const stockOf = (
    ew: number,
    mw: number,
    act: number,
    batch: Batch,
    at: Date
  ): Stock => {
    const k = key(ew, mw, act, batch.id)
    let s = stocks.get(k)
    if (!s) {
      const node = nodeByEw.get(ew)!
      const m = materialByMw.get(mw)!
      ensureEma(ew, mw, act)
      const row: Row = {
        id: nextId("ws_stocks"),
        batch_id: batch.id,
        entity_id: ew,
        material_id: mw,
        parent_material_id: m.parentMw,
        activity_id: act,
        budget_source_id:
          node.level === "kemenkes" ? ids.budgetSourceCentral : null,
        stock_quality_id: ids.stockQuality,
        year: at.getUTCFullYear(),
        price: 0,
        total_price: 0,
        batch_code: batch.code,
        manufacture_id: batch.manufacturer,
        created_by: input.userId,
        updated_by: input.userId,
        created_at: at,
        updated_at: at,
      }
      s = {
        row,
        ew,
        mw,
        activityId: act,
        batch,
        qty: 0,
        allocated: 0,
        inTransit: 0,
        unreceived: 0,
      }
      stocks.set(k, s)
      out.stocks.push(row)
    }
    return s
  }

  const tx = (
    stock: Stock,
    type: number,
    change: number,
    at: Date,
    extra: {
      companion?: number | null
      orderId?: number | null
      reason?: number | null
      status?: number | null
      returnable?: number
    } = {}
  ) => {
    const opening = stock.qty
    if (opening + change < 0) throw new Error(`negative stock ${stock.row.id}`)
    stock.qty = opening + change
    stock.row.updated_at = at
    out.transactions.push({
      id: nextId("ws_transactions"),
      activity_id: stock.activityId,
      entity_activity_id: entityActivityId(stock.ew, stock.activityId),
      opening_qty: opening,
      change_qty: change,
      transaction_type_id: type,
      transaction_reason_id: extra.reason ?? null,
      entity_id: stock.ew,
      companion_entity_id: extra.companion ?? null,
      stock_id: stock.row.id,
      order_id: extra.orderId ?? null,
      batch_code: stock.batch.code,
      device_type: rng.chance(0.6) ? 2 : 1,
      actual_transaction_date: dateOnly(at),
      created_by: input.userId,
      updated_by: input.userId,
      created_at: at,
      updated_at: at,
      status: extra.status ?? null,
      returned_qty: 0,
      returnable: extra.returnable ?? 0,
      returned_qty_open_vial: 0,
      opening_qty_open_vial: 0,
      change_qty_open_vial: 0,
      qty_in_vial: 0,
      is_acknowledged: 0,
      uuid: rng.uuid(),
    })
  }

  const holding = (ew: number, mw: number, act: number) => {
    let total = 0
    for (const b of batchesByMaterial.get(mw) ?? []) {
      const s = stocks.get(key(ew, mw, act, b.id))
      if (s) total += s.qty - s.allocated + s.unreceived
    }
    return total
  }
  /** FEFO list of stock rows with free quantity */
  const freeStocks = (ew: number, mw: number, act: number) =>
    (batchesByMaterial.get(mw) ?? [])
      .map((b) => stocks.get(key(ew, mw, act, b.id)))
      .filter((s): s is Stock => !!s && s.qty - s.allocated > 0)
      .sort(
        (a, b) =>
          a.batch.expiry.getTime() - b.batch.expiry.getTime() ||
          a.batch.id - b.batch.id
      )

  // ---------- opening balance (stock count) one day before the window ----------
  const openingAt = new Date(input.start.getTime() - DAY)
  for (const { activity, materials } of plan) {
    for (const m of materials) {
      const batches = [
        newBatch(m, openingAt, 6, 12),
        newBatch(m, openingAt, 12, 20),
      ]
      for (const n of holders) {
        const qty = roundUp(target(n, m.mw, activity.id), m.perPack)
        if (qty <= 0) continue
        const first = roundUp(qty * 0.4, m.perPack)
        const parts = [first, qty - first].filter((q) => q > 0)
        parts.forEach((q, i) => {
          const s = stockOf(
            n.ew,
            m.mw,
            activity.id,
            batches[i]!,
            workTime(rng, openingAt)
          )
          tx(s, ids.txType.stockCount, q, workTime(rng, openingAt))
        })
      }
    }
  }

  // ---------- orders ----------
  const pending: PendingOrder[] = []
  const createOrder = (
    vendor: DummyNode,
    customer: DummyNode,
    activityId: number,
    lines: { mw: number; qty: number }[],
    type: "request" | "distribution",
    day: Date
  ) => {
    if (!lines.length) return
    const created = workTime(rng, day)
    const steps: { status: keyof DummyIds["orderStatus"]; gap: number }[] =
      type === "request"
        ? [
            { status: "pending", gap: 0 },
            { status: "confirmed", gap: rng.int(0, 1) },
            { status: "allocated", gap: rng.int(0, 1) },
            { status: "shipped", gap: rng.int(1, 2) },
            { status: "fulfilled", gap: rng.int(1, 3) },
          ]
        : [
            { status: "allocated", gap: 0 },
            { status: "shipped", gap: rng.int(0, 1) },
            { status: "fulfilled", gap: rng.int(2, 5) },
          ]
    let t = created.getTime()
    const schedule = steps.map((s, i) => {
      t += s.gap * DAY + (i === 0 ? 0 : rng.int(10, 240) * 60_000)
      return { status: s.status, at: new Date(t) }
    })
    const order: Row = {
      id: nextId("ws_orders"),
      customer_id: customer.ew,
      vendor_id: vendor.ew,
      order_status_id: ids.orderStatus[schedule[0]!.status],
      order_type_id: ids.orderType[type],
      activity_id: activityId,
      delivery_type_id: null,
      device_type: rng.chance(0.5) ? 2 : 1,
      is_allocated: 0,
      taken_by_customer: 0,
      total_order_items: lines.length,
      created_by: input.userId,
      updated_by: input.userId,
      created_at: created,
      updated_at: created,
    }
    out.orders.push(order)
    pending.push({
      order,
      vendorEw: vendor.ew,
      customerEw: customer.ew,
      activityId,
      lines,
      allocations: [],
      schedule,
      done: 0,
    })
  }

  const advanceOrders = (until: Date) => {
    for (const po of pending) {
      while (
        po.done < po.schedule.length &&
        po.schedule[po.done]!.at.getTime() <= until.getTime()
      ) {
        const step = po.schedule[po.done]!
        const at = step.at
        if (step.status === "pending" || step.status === "confirmed") {
          if (step.status === "pending")
            for (const line of po.lines)
              po.allocations.push({
                stock: null as unknown as Stock,
                qty: line.qty,
                item: pushItem(po, line.mw, null, line.qty, at),
              })
        } else if (step.status === "allocated") {
          const requested = po.allocations.length
            ? po.allocations.map((a) => ({
                mw: a.item.material_id as number,
                qty: a.qty,
                item: a.item,
              }))
            : po.lines.map((l) => ({ ...l, item: null as Row | null }))
          po.allocations = []
          for (const line of requested) {
            let remaining = line.qty
            let reuse = line.item
            for (const s of freeStocks(po.vendorEw, line.mw, po.activityId)) {
              if (remaining <= 0) break
              const q = Math.min(remaining, s.qty - s.allocated)
              s.allocated += q
              remaining -= q
              let item: Row
              if (reuse) {
                item = reuse
                reuse = null
                Object.assign(item, {
                  stock_id: s.row.id,
                  allocated_qty: q,
                  confirmed_qty: q,
                  qty: q,
                  updated_at: at,
                })
              } else
                item = pushItem(
                  po,
                  line.mw,
                  s.row.id as number,
                  q,
                  at,
                  line.qty
                )
              po.allocations.push({ stock: s, qty: q, item })
            }
            if (reuse)
              Object.assign(reuse, {
                allocated_qty: 0,
                confirmed_qty: 0,
                qty: 0,
                updated_at: at,
              })
          }
          if (!po.allocations.length) {
            // vendor had nothing to allocate: drop an empty distribution, freeze a request
            if (po.order.order_type_id === ids.orderType.distribution) {
              out.orders.splice(out.orders.indexOf(po.order), 1)
              for (let i = out.orderItems.length - 1; i >= 0; i--)
                if (out.orderItems[i]!.order_id === po.order.id)
                  out.orderItems.splice(i, 1)
            }
            po.schedule = po.schedule.slice(0, po.done)
            break
          }
          po.order.is_allocated = 1
        } else if (step.status === "shipped") {
          for (const a of po.allocations) {
            a.stock.allocated -= a.qty
            a.stock.inTransit += a.qty
            tx(a.stock, ids.txType.out, -a.qty, at, {
              companion: po.customerEw,
              orderId: po.order.id as number,
            })
            const recv = stockOf(
              po.customerEw,
              a.stock.mw,
              po.activityId,
              a.stock.batch,
              at
            )
            recv.unreceived += a.qty
          }
        } else if (step.status === "fulfilled") {
          for (const a of po.allocations) {
            a.stock.inTransit -= a.qty
            const recv = stockOf(
              po.customerEw,
              a.stock.mw,
              po.activityId,
              a.stock.batch,
              at
            )
            recv.unreceived -= a.qty
            tx(recv, ids.txType.in, a.qty, at, {
              companion: po.vendorEw,
              orderId: po.order.id as number,
              returnable: 1,
            })
            Object.assign(a.item, {
              received_qty: a.qty,
              fulfill_stock_status_id: ids.orderStockStatus,
              updated_at: at,
            })
          }
        }
        po.order.order_status_id = ids.orderStatus[step.status]
        po.order.updated_at = at
        out.orderHistories.push({
          id: nextId("ws_order_histories"),
          order_id: po.order.id,
          order_status_id: ids.orderStatus[step.status],
          created_by: input.userId,
          updated_by: input.userId,
          created_at: at,
          updated_at: at,
        })
        po.done += 1
      }
    }
  }
  const pushItem = (
    po: PendingOrder,
    mw: number,
    stockId: number | null,
    qty: number,
    at: Date,
    ordered = qty
  ): Row => {
    const item: Row = {
      id: nextId("ws_order_item_stocks"),
      order_id: po.order.id,
      material_id: mw,
      parent_material_id: materialByMw.get(mw)?.parentMw ?? null,
      stock_id: stockId,
      order_stock_status_id: ids.orderStockStatus,
      qty,
      ordered_qty: ordered,
      allocated_qty: stockId ? qty : 0,
      confirmed_qty: stockId ? qty : 0,
      received_qty: 0,
      created_by: input.userId,
      updated_by: input.userId,
      created_at: at,
      updated_at: at,
    }
    out.orderItems.push(item)
    return item
  }

  /** replenishment lines for a customer from its vendor */
  const replenishLines = (
    customer: DummyNode,
    materials: DummyMaterial[],
    act: number,
    horizonMonths: number
  ) =>
    materials
      .map((m) => {
        const need = monthlyNeed(customer.ew, m.mw, act)
        const gap =
          target(customer, m.mw, act) +
          need * horizonMonths -
          holding(customer.ew, m.mw, act)
        return {
          mw: m.mw,
          qty: gap > need * 0.25 ? roundUp(gap, m.perPack) : 0,
        }
      })
      .filter((l) => l.qty > 0)

  // ---------- day-by-day simulation ----------
  const lastmileOf = new Map<number, number[]>()
  for (const n of input.nodes)
    if (n.level === "lastmile" && n.parentEw !== null)
      lastmileOf.set(n.parentEw, [...(lastmileOf.get(n.parentEw) ?? []), n.ew])

  const kemenkes = holders.filter((n) => n.level === "kemenkes")
  const provs = holders.filter((n) => n.level === "provinsi")
  const kabs = holders.filter((n) => n.level === "kabkota")
  const startDay = dateOnly(input.start).getTime()
  const endDay = dateOnly(input.end).getTime()

  for (let t = startDay; t <= endDay; t += DAY) {
    const day = new Date(t)
    const dom = day.getUTCDate()
    const dow = day.getUTCDay()
    const monthIndex = Math.round(
      (Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1) -
        Date.UTC(input.start.getUTCFullYear(), input.start.getUTCMonth(), 1)) /
        (30.44 * DAY)
    )
    advanceOrders(new Date(t + 9 * 3_600_000))

    for (const { activity, materials } of plan) {
      // procurement at the central level every quarter
      if (dom === 2 && monthIndex % 3 === 0) {
        for (const k of kemenkes)
          for (const m of materials) {
            const gap =
              target(k, m.mw, activity.id) +
              monthlyNeed(k.ew, m.mw, activity.id) * 3 -
              holding(k.ew, m.mw, activity.id)
            if (gap <= 0) continue
            const qty = roundUp(gap, m.perPack * 10)
            const batch = newBatch(m, day, 18, 30)
            tx(
              stockOf(k.ew, m.mw, activity.id, batch, workTime(rng, day)),
              ids.txType.addStock,
              qty,
              workTime(rng, day),
              { reason: ids.addStockReason }
            )
          }
      }
      // Kemenkes -> provinsi, every two months
      if (dom === 5 && monthIndex % 2 === 0)
        for (const p of provs)
          createOrder(
            nodeByEw.get(p.parentEw!)!,
            p,
            activity.id,
            replenishLines(p, materials, activity.id, 2),
            "distribution",
            day
          )
      // provinsi -> kab/kota, monthly
      if (dom === 9)
        for (const k of kabs)
          createOrder(
            nodeByEw.get(k.parentEw!)!,
            k,
            activity.id,
            replenishLines(k, materials, activity.id, 1),
            "distribution",
            day
          )
      // puskesmas request to kab/kota, monthly
      if (dom === 14)
        for (const p of pkms)
          createOrder(
            nodeByEw.get(p.parentEw!)!,
            p,
            activity.id,
            replenishLines(p, materials, activity.id, 1),
            "request",
            day
          )

      // orders still in progress when the window closes (pending .. shipped)
      if (t === endDay - 3 * DAY || t === endDay - DAY) {
        for (const p of pkms)
          if (rng.chance(0.4))
            createOrder(
              nodeByEw.get(p.parentEw!)!,
              p,
              activity.id,
              replenishLines(p, materials, activity.id, 1.5),
              "request",
              day
            )
        for (const k of kabs)
          if (rng.chance(0.3))
            createOrder(
              nodeByEw.get(k.parentEw!)!,
              k,
              activity.id,
              replenishLines(k, materials, activity.id, 1.5),
              "distribution",
              day
            )
      }

      // consumption sessions at puskesmas (Tue/Thu), only in active months
      const active =
        activity.activeMonths.length === 0 ||
        activity.activeMonths.includes(day.getUTCMonth())
      if (active && (dow === 2 || dow === 4)) {
        for (const p of pkms)
          for (const m of materials) {
            const monthly = consumption.get(key(p.ew, m.mw, activity.id)) ?? 0
            let want = Math.round((monthly / 8.6) * rng.float(0.7, 1.3))
            if (want <= 0) continue
            const companions = lastmileOf.get(p.ew) ?? []
            const companion = companions.length ? rng.pick(companions) : null
            const at = workTime(rng, day)
            for (const s of freeStocks(p.ew, m.mw, activity.id)) {
              if (want <= 0) break
              const q = Math.min(want, s.qty - s.allocated)
              tx(s, ids.txType.consumption, -q, at, {
                companion,
                status: 1,
                returnable: 1,
              })
              want -= q
            }
          }
      }
      // occasional discard (broken / damaged / expired) at lower levels
      if (dom === 25 && ids.discardReasons.length)
        for (const n of [...provs, ...kabs, ...pkms])
          for (const m of materials) {
            if (!rng.chance(0.08)) continue
            const s = freeStocks(n.ew, m.mw, activity.id)[0]
            if (!s) continue
            const q = Math.min(
              s.qty - s.allocated,
              Math.max(1, Math.round(m.perPack * rng.int(1, 3)))
            )
            if (q > 0)
              tx(s, ids.txType.discard, -q, workTime(rng, day), {
                reason: rng.pick(ids.discardReasons),
              })
          }
    }
  }
  advanceOrders(new Date(endDay + 23 * 3_600_000))

  // ---------- finalise stock rows ----------
  for (const s of stocks.values()) {
    Object.assign(s.row, {
      qty: s.qty,
      allocated_qty: s.allocated,
      in_transit_qty: s.inTransit,
      unreceived_qty: s.unreceived,
      cutoff_qty: s.qty,
      exterminated_qty: 0,
      open_vial_qty: 0,
    })
  }
  for (const n of holders)
    for (const { activity } of plan) entityActivityId(n.ew, activity.id)

  out.summary = {
    activities: plan.length,
    materials: new Set(plan.flatMap((p) => p.materials.map((m) => m.mw))).size,
    batches: out.batches.length,
    stocks: out.stocks.length,
    orders: out.orders.length,
    orderItems: out.orderItems.length,
    transactions: out.transactions.length,
  }
  return out
}
