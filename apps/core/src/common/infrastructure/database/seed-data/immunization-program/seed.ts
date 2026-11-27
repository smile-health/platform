import { sql, type Kysely } from "kysely"
import {
  generateDummy,
  type DummyActivity,
  type DummyMaterial,
  type DummyNode,
} from "./dummy.js"
import { mustGet, resolveIds } from "./id-resolver.js"
import {
  buildSeedUsers,
  grantWorkspace,
  syncKeycloakUsers,
  upsertSeedUsers,
} from "./users.js"
import rawSnapshot from "./snapshot.json"

/**
 * Immunization program ("immunization", distinct from "immunization_beneficiaries")
 * for SMILE Health, built from a sanitized snapshot of SMILE production onprem master
 * data (BA-960) plus generated dummy transactional data.
 *
 * Master rows are only inserted when missing, so re-running is safe. Dummy rows live in
 * the reserved id range [DUMMY_ID_BASE, DUMMY_ID_END) and are rebuilt on every run.
 */

export const DUMMY_ID_BASE = 1_960_000_000
export const DUMMY_ID_END = 1_970_000_000
const OFFSET_SMALL = 900_000
const OFFSET_ACTIVITY = 9_000
const OFFSET_LARGE = 1_000_000_000

type Row = Record<string, any>
type Db = Kysely<any>
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
/** JSON keeps dates as ISO strings; MySQL needs Date objects */
function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reviveDates) as T
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, reviveDates(v)])
    ) as T
  if (typeof value === "string" && ISO_DATE.test(value))
    return new Date(value) as T
  return value
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const snapshot = reviveDates(rawSnapshot) as any

const DUMMY_TABLES = [
  "ws_transactions",
  "ws_order_histories",
  "ws_order_item_stocks",
  "ws_orders",
  "ws_stocks",
  "ws_batches",
  "ws_customer_vendor_activities",
  "ws_customer_vendors",
  "ws_entity_material_activities",
  "ws_entity_activities",
] as const

const norm = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toUpperCase()

async function insertChunked(db: Db, table: string, rows: Row[], size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    await db
      .insertInto(table)
      .values(rows.slice(i, i + size))
      .execute()
  }
}

/**
 * Insert the snapshot rows of one table that are not in the target yet and
 * return source id -> target id.
 */
async function syncTable(
  db: Db,
  table: string,
  rows: Row[],
  opts: {
    key: (row: Row) => string
    existing: Row[]
    existingKey: (row: Row) => string
    offset: number
    toRow: (row: Row, id: number) => Row
    sourceId?: (row: Row) => number
  }
): Promise<Map<number, number>> {
  const existingById = new Map<number, string>()
  const existingByKey = new Map<string, number>()
  for (const e of opts.existing) {
    const k = opts.existingKey(e)
    existingById.set(Number(e.id), k)
    if (!existingByKey.has(k)) existingByKey.set(k, Number(e.id))
  }
  const sourceId = opts.sourceId ?? ((r: Row) => Number(r.id))
  const resolved = resolveIds(rows, {
    id: sourceId,
    key: opts.key,
    existingById,
    existingByKey,
    offset: opts.offset,
  })
  const fresh: Row[] = []
  const seen = new Set<number>()
  for (const r of rows) {
    const target = resolved.get(sourceId(r))!
    if (target.exists || seen.has(target.id)) continue
    seen.add(target.id)
    fresh.push(opts.toRow(r, target.id))
  }
  await insertChunked(db, table, fresh)
  return new Map([...resolved].map(([k, v]) => [k, v.id]))
}

async function idsWhere(
  db: Db,
  table: string,
  column: string,
  values: unknown[],
  cols: string[]
): Promise<Row[]> {
  if (!values.length) return []
  const out: Row[] = []
  for (let i = 0; i < values.length; i += 1000) {
    out.push(
      ...(await db
        .selectFrom(table)
        .select(cols)
        .where(column, "in", values.slice(i, i + 1000))
        .execute())
    )
  }
  return out
}

function lookup(
  rows: Row[],
  field: string,
  wanted: string,
  table: string
): number {
  const hit = rows.find((r) => norm(r[field]) === norm(wanted))
  if (!hit) throw new Error(`${table}: "${wanted}" not found`)
  return Number(hit.id)
}

export interface SeedOptions {
  /** end of the dummy window (default: today) */
  end?: Date
  months?: number
  seed?: number
  log?: (msg: string) => void
}

export async function seedImmunizationProgram(
  database: Db,
  options: SeedOptions = {}
) {
  const log =
    options.log ?? ((m: string) => console.log(`[immunization-seed] ${m}`))
  const end = options.end ?? new Date()
  const months = options.months ?? 12
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months + 1, 1)
  )

  const result = await database.transaction().execute(async (db) => {
    // ---------- user + workspace ----------
    const envUser = Number(process.env.SEED_USER_ID ?? 0)
    const user =
      envUser ||
      Number(
        (
          await db
            .selectFrom("users")
            .select("id")
            .where("deleted_at", "is", null)
            .orderBy("role")
            .orderBy(sql`status is null`)
            .orderBy("id")
            .executeTakeFirstOrThrow()
        ).id
      )
    const ws = snapshot.workspace
    let workspace = await db
      .selectFrom("workspaces")
      .select("id")
      .where("key", "=", ws.key)
      .executeTakeFirst()
    if (!workspace) {
      await db
        .insertInto("workspaces")
        .values({
          key: ws.key,
          name: ws.name,
          description: ws.description,
          app_type: ws.app_type,
          is_beneficiaries: ws.is_beneficiaries,
          config: JSON.stringify(ws.config),
          created_by: user,
          updated_by: user,
        })
        .execute()
      workspace = await db
        .selectFrom("workspaces")
        .select("id")
        .where("key", "=", ws.key)
        .executeTakeFirstOrThrow()
    }
    const wsId = Number(workspace.id)
    log(`workspace "${ws.key}" id=${wsId}, seed user id=${user}`)

    // every existing admin (Super Admin / Admin) gets access to this program
    const adminRoles = await db
      .selectFrom("roles")
      .select("id")
      .where("name", "in", ["Super Admin", "Admin"])
      .execute()
    await grantWorkspace(
      db,
      wsId,
      adminRoles.length
        ? (
            await db
              .selectFrom("users")
              .select("id")
              .where("deleted_at", "is", null)
              .where(
                "role",
                "in",
                adminRoles.map((r) => Number(r.id))
              )
              .execute()
          ).map((r) => Number(r.id))
        : []
    )

    // ---------- global lookups ----------
    const unitMap = await syncTable(
      db,
      "material_units",
      snapshot.material_units,
      {
        key: (r) => `${r.type}|${norm(r.name)}`,
        existing: await db
          .selectFrom("material_units")
          .select(["id", "name", "type"])
          .execute(),
        existingKey: (r) => `${r.type}|${norm(r.name)}`,
        offset: OFFSET_ACTIVITY,
        toRow: (r, id) => ({ id, name: r.name, type: r.type }),
      }
    )
    const subtypeMap = await syncTable(
      db,
      "material_subtypes",
      snapshot.material_subtypes,
      {
        key: (r) => `${r.material_type_id}|${norm(r.name)}`,
        existing: await db
          .selectFrom("material_subtypes")
          .select(["id", "name", "material_type_id"])
          .execute(),
        existingKey: (r) => `${r.material_type_id}|${norm(r.name)}`,
        offset: OFFSET_ACTIVITY,
        toRow: (r, id) => ({
          id,
          name: r.name,
          material_type_id: r.material_type_id,
        }),
      }
    )
    const manufactureMap = await syncTable(
      db,
      "manufactures",
      snapshot.manufactures,
      {
        key: (r) => norm(r.name),
        existing: await db
          .selectFrom("manufactures")
          .select(["id", "name"])
          .execute(),
        existingKey: (r) => norm(r.name),
        offset: OFFSET_SMALL,
        toRow: (r, id) => ({
          id,
          name: r.name,
          type: r.type,
          reference_id: r.reference_id,
          description: r.description,
          status: r.status,
          created_by: user,
          updated_by: user,
        }),
      }
    )

    // ---------- locations (BPS codes are shared ids) ----------
    const locById = new Map<number, Row>(
      snapshot.locations.map((l: Row) => [Number(l.id), l])
    )
    const pathOf = (id: number): string => {
      const l = locById.get(id)
      return l?.parent_id ? `${pathOf(Number(l.parent_id))}#${id}` : String(id)
    }
    const knownLoc = new Set(
      (await idsWhere(db, "locations", "id", [...locById.keys()], ["id"])).map(
        (r) => Number(r.id)
      )
    )
    await insertChunked(
      db,
      "locations",
      snapshot.locations
        .filter((l: Row) => !knownLoc.has(Number(l.id)))
        .map((l: Row) => ({
          id: l.id,
          parent_id: l.parent_id,
          name: l.name,
          lat: l.lat,
          lng: l.lng,
          level: l.level,
          path: pathOf(Number(l.id)),
        }))
    )

    // ---------- entities ----------
    const entityKey = (r: Row) => `${r.entity_tag_id}|${norm(r.code)}`
    const entityMap = await syncTable(db, "entities", snapshot.entities, {
      key: entityKey,
      existing: [
        ...(await idsWhere(
          db,
          "entities",
          "id",
          snapshot.entities.flatMap((e: Row) => [e.id, e.id + OFFSET_LARGE]),
          ["id", "code", "entity_tag_id"]
        )),
        ...(await idsWhere(
          db,
          "entities",
          "code",
          snapshot.entities.map((e: Row) => e.code),
          ["id", "code", "entity_tag_id"]
        )),
      ],
      existingKey: entityKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({
        ...r,
        id,
        location_id:
          r.village_id ??
          r.sub_district_id ??
          r.regency_id ??
          r.province_id ??
          null,
        created_by: user,
        updated_by: user,
      }),
    })

    // ---------- materials ----------
    // materials.code is unique in SMILE Health, so the code identifies a material
    const materialKey = (r: Row) => norm(r.code)
    const materialMap = await syncTable(db, "materials", snapshot.materials, {
      key: materialKey,
      existing: await db
        .selectFrom("materials")
        .select(["id", "code"])
        .execute(),
      existingKey: materialKey,
      offset: OFFSET_SMALL,
      toRow: (r, id) => ({
        ...r,
        id,
        unit_of_consumption_id: mustGet(
          unitMap,
          r.unit_of_consumption_id,
          "unit"
        ),
        unit_of_distribution_id: mustGet(
          unitMap,
          r.unit_of_distribution_id,
          "unit"
        ),
        material_subtype_id: r.material_subtype_id
          ? mustGet(subtypeMap, r.material_subtype_id, "subtype")
          : null,
        created_by: user,
        updated_by: user,
      }),
    })
    const relKey = (r: Row) => `${r.child_material_id}|${r.parent_material_id}`
    const relations = snapshot.material_relations.map((r: Row) => ({
      ...r,
      child_material_id: materialMap.get(r.child_material_id),
      parent_material_id: materialMap.get(r.parent_material_id),
    }))
    await syncTable(db, "material_relations", relations, {
      key: relKey,
      existing: await idsWhere(
        db,
        "material_relations",
        "child_material_id",
        relations.map((r: Row) => r.child_material_id),
        ["id", "child_material_id", "parent_material_id"]
      ),
      existingKey: relKey,
      offset: OFFSET_SMALL,
      toRow: (r) => ({
        child_material_id: r.child_material_id,
        parent_material_id: r.parent_material_id,
      }),
    })

    // ---------- workspace-scoped master ----------
    const wsRows = async (
      table: string,
      ids: number[],
      cols: string[],
      wsCol = "workspace_id"
    ) => [
      ...(await idsWhere(db, table, "id", ids, cols)),
      ...(await db
        .selectFrom(table)
        .select(cols)
        .where(wsCol, "=", wsId)
        .execute()),
    ]
    const mfwKey = (r: Row) => `${r.manufacture_id}|${r.workspace_id}`
    const mfwRows = snapshot.manufacture_workspaces.map((r: Row) => ({
      ...r,
      manufacture_id: manufactureMap.get(r.manufacture_id),
      workspace_id: wsId,
    }))
    const mfwMap = await syncTable(db, "manufacture_workspaces", mfwRows, {
      key: mfwKey,
      existing: await wsRows(
        "manufacture_workspaces",
        mfwRows.flatMap((r: Row) => [r.id, r.id + OFFSET_SMALL]),
        ["id", "manufacture_id", "workspace_id"]
      ),
      existingKey: mfwKey,
      offset: OFFSET_SMALL,
      toRow: (r, id) => ({
        id,
        manufacture_id: r.manufacture_id,
        workspace_id: wsId,
        status: r.status,
        updated_by: user,
      }),
    })
    const budgetSources = await db
      .selectFrom("budget_sources")
      .select(["id", "name"])
      .where("deleted_at", "is", null)
      .execute()
    const bswRows = snapshot.budget_source_workspaces
      .map((r: Row) => ({
        ...r,
        budget_source_id: budgetSources.find(
          (b) => norm(b.name) === norm(r.budget_source_name)
        )?.id,
        workspace_id: wsId,
      }))
      .filter((r: Row) => r.budget_source_id)
    const bswKey = (r: Row) => `${r.budget_source_id}|${r.workspace_id}`
    const bswMap = await syncTable(db, "budget_source_workspaces", bswRows, {
      key: bswKey,
      existing: await wsRows(
        "budget_source_workspaces",
        bswRows.flatMap((r: Row) => [r.id, r.id + OFFSET_SMALL]),
        ["id", "budget_source_id", "workspace_id"]
      ),
      existingKey: bswKey,
      offset: OFFSET_SMALL,
      toRow: (r, id) => ({
        id,
        budget_source_id: r.budget_source_id,
        workspace_id: wsId,
        status: r.status,
      }),
    })

    const mwKey = (r: Row) => `${r.material_id}|${r.workspace_id}`
    const mwRows = snapshot.material_workspaces.map((r: Row) => ({
      ...r,
      material_id: materialMap.get(r.material_id),
      workspace_id: wsId,
    }))
    const mwMap = await syncTable(db, "material_workspaces", mwRows, {
      key: mwKey,
      existing: await wsRows(
        "material_workspaces",
        mwRows.flatMap((r: Row) => [r.id, r.id + OFFSET_SMALL]),
        ["id", "material_id", "workspace_id"]
      ),
      existingKey: mwKey,
      offset: OFFSET_SMALL,
      toRow: (r, id) => ({ ...r, id, created_by: user, updated_by: user }),
    })

    const actKey = (r: Row) => `${r.program_id}|${norm(r.name)}`
    const actRows = snapshot.activities.map((r: Row) => ({
      ...r,
      program_id: wsId,
    }))
    const activityMap = await syncTable(db, "ws_activities", actRows, {
      key: actKey,
      existing: await db
        .selectFrom("ws_activities")
        .select(["id", "program_id", "name"])
        .execute(),
      existingKey: actKey,
      offset: OFFSET_ACTIVITY,
      toRow: (r, id) => ({ ...r, id, created_by: user, updated_by: user }),
    })

    const maKey = (r: Row) => `${r.material_id}|${r.activity_id}`
    const maRows = snapshot.material_activities
      .filter(
        (r: Row) => mwMap.has(r.material_id) && activityMap.has(r.activity_id)
      )
      .map((r: Row) => ({
        ...r,
        material_id: mwMap.get(r.material_id),
        activity_id: activityMap.get(r.activity_id),
      }))
    await syncTable(db, "ws_material_activities", maRows, {
      key: maKey,
      existing: await idsWhere(
        db,
        "ws_material_activities",
        "material_id",
        [...new Set(maRows.map((r: Row) => r.material_id))],
        ["id", "material_id", "activity_id"]
      ),
      existingKey: maKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({ ...r, id, created_by: user, updated_by: user }),
    })
    const mmKey = (r: Row) => `${r.material_id}|${r.manufacture_id}`
    const mmRows = snapshot.material_manufactures
      .filter(
        (r: Row) => mwMap.has(r.material_id) && mfwMap.has(r.manufacture_id)
      )
      .map((r: Row) => ({
        ...r,
        material_id: mwMap.get(r.material_id),
        manufacture_id: mfwMap.get(r.manufacture_id),
      }))
    await syncTable(db, "ws_material_manufactures", mmRows, {
      key: mmKey,
      existing: await idsWhere(
        db,
        "ws_material_manufactures",
        "material_id",
        [...new Set(mmRows.map((r: Row) => r.material_id))],
        ["id", "material_id", "manufacture_id"]
      ),
      existingKey: mmKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({
        id,
        material_id: r.material_id,
        manufacture_id: r.manufacture_id,
      }),
    })

    const ewKey = (r: Row) => `${r.entity_id}|${r.workspace_id}`
    const ewRows = snapshot.entity_workspaces.map((r: Row) => ({
      ...r,
      entity_id: entityMap.get(r.entity_id),
      workspace_id: wsId,
    }))
    const ewMap = await syncTable(db, "entity_workspaces", ewRows, {
      key: ewKey,
      existing: await wsRows(
        "entity_workspaces",
        ewRows.flatMap((r: Row) => [r.id, r.id + OFFSET_LARGE]),
        ["id", "entity_id", "workspace_id"]
      ),
      existingKey: ewKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({ ...r, id, created_by: user, updated_by: user }),
    })
    const ewIds = [...new Set(ewMap.values())]

    const eaKey = (r: Row) => `${r.entity_id}|${r.activity_id}`
    const eaRows = snapshot.entity_activities.map((r: Row) => ({
      ...r,
      entity_id: ewMap.get(r.entity_id),
      activity_id: activityMap.get(r.activity_id),
    }))
    await syncTable(db, "ws_entity_activities", eaRows, {
      key: eaKey,
      existing: await idsWhere(db, "ws_entity_activities", "entity_id", ewIds, [
        "id",
        "entity_id",
        "activity_id",
      ]),
      existingKey: eaKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({ ...r, id }),
    })
    const emaKey = (r: Row) =>
      `${r.entity_id}|${r.material_id}|${r.activity_id}`
    const emaRows = snapshot.entity_material_activities
      .filter((r: Row) => mwMap.has(r.material_id))
      .map((r: Row) => ({
        ...r,
        entity_id: ewMap.get(r.entity_id),
        material_id: mwMap.get(r.material_id),
        activity_id: activityMap.get(r.activity_id),
      }))
    await syncTable(db, "ws_entity_material_activities", emaRows, {
      key: emaKey,
      existing: await idsWhere(
        db,
        "ws_entity_material_activities",
        "entity_id",
        ewIds,
        ["id", "entity_id", "material_id", "activity_id"]
      ),
      existingKey: emaKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({ ...r, id, created_by: user, updated_by: user }),
    })
    const cvKey = (r: Row) => `${r.customer_id}|${r.vendor_id}|${r.program_id}`
    const cvRows = snapshot.customer_vendors.map((r: Row) => ({
      ...r,
      customer_id: ewMap.get(r.customer_id),
      vendor_id: ewMap.get(r.vendor_id),
      program_id: wsId,
    }))
    const cvMap = await syncTable(db, "ws_customer_vendors", cvRows, {
      key: cvKey,
      existing: await idsWhere(
        db,
        "ws_customer_vendors",
        "customer_id",
        ewIds,
        ["id", "customer_id", "vendor_id", "program_id"]
      ),
      existingKey: cvKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({ ...r, id }),
    })
    const cvaKey = (r: Row) => `${r.customer_vendor_id}|${r.activity_id}`
    const cvaRows = snapshot.customer_vendor_activities
      .filter(
        (r: Row) =>
          cvMap.has(r.customer_vendor_id) && activityMap.has(r.activity_id)
      )
      .map((r: Row) => ({
        ...r,
        customer_vendor_id: cvMap.get(r.customer_vendor_id),
        activity_id: activityMap.get(r.activity_id),
      }))
    await syncTable(db, "ws_customer_vendor_activities", cvaRows, {
      key: cvaKey,
      existing: await idsWhere(
        db,
        "ws_customer_vendor_activities",
        "customer_vendor_id",
        [...cvMap.values()],
        ["id", "customer_vendor_id", "activity_id"]
      ),
      existingKey: cvaKey,
      offset: OFFSET_LARGE,
      toRow: (r, id) => ({ ...r, id }),
    })

    // ---------- program configuration ----------
    const txTypes = await db
      .selectFrom("ws_transaction_types")
      .select(["id", "title"])
      .execute()
    const typeByTitle = (t: string) =>
      lookup(txTypes, "title", t, "ws_transaction_types")
    const prodTypeTitle: Record<number, string> = {
      1: "Stock Count",
      2: "Pengeluaran",
      3: "Penerimaan",
      4: "Pembuangan",
      5: "Pengembalian Faskes",
      6: "Penerimaan Vial Terbuka",
      7: "Add Stock",
      8: "Remove Stock",
      9: "Pembatalan Pembuangan",
      10: "Konsumsi",
      11: "Transfer Stok",
    }
    const reasonKey = (r: Row) =>
      `${r.program_id}|${r.transaction_type_id}|${norm(r.title)}`
    const reasonRows = snapshot.transaction_reasons.map((r: Row) => ({
      ...r,
      program_id: wsId,
      transaction_type_id: typeByTitle(
        mustGet(
          new Map(
            Object.entries(prodTypeTitle).map(([k, v]) => [Number(k), v])
          ),
          r.transaction_type_id,
          "transaction type"
        )
      ),
    }))
    await syncTable(db, "ws_transaction_reasons", reasonRows, {
      key: reasonKey,
      existing: await db
        .selectFrom("ws_transaction_reasons")
        .select(["id", "program_id", "transaction_type_id", "title"])
        .where("program_id", "=", wsId)
        .execute(),
      existingKey: reasonKey,
      offset: 0,
      sourceId: (r) => -Number(r.prod_id),
      toRow: (r) => {
        const { prod_id: _drop, ...rest } = r
        return { ...rest, created_by: user, updated_by: user }
      },
    })
    const reasons = await db
      .selectFrom("ws_transaction_reasons")
      .select(["id", "title", "transaction_type_id"])
      .where("program_id", "=", wsId)
      .where("deleted_at", "is", null)
      .execute()
    const errKey = (r: Row) => `${r.program_id}|${norm(r.title)}`
    const errParents = snapshot.event_report_reasons.filter(
      (r: Row) => !r.parent_id
    )
    const errMap = await syncTable(
      db,
      "ws_event_report_reasons",
      errParents.map((r: Row) => ({ ...r, program_id: wsId })),
      {
        key: errKey,
        existing: await db
          .selectFrom("ws_event_report_reasons")
          .select(["id", "program_id", "title"])
          .execute(),
        existingKey: errKey,
        offset: OFFSET_SMALL,
        toRow: (r, id) => ({ ...r, id }),
      }
    )
    const errChildren = snapshot.event_report_reasons
      .filter((r: Row) => r.parent_id)
      .map((r: Row) => ({
        ...r,
        program_id: wsId,
        parent_id: errMap.get(r.parent_id),
      }))
    const errChildKey = (r: Row) =>
      `${r.program_id}|${r.parent_id}|${norm(r.title)}`
    await syncTable(db, "ws_event_report_reasons", errChildren, {
      key: errChildKey,
      existing: await db
        .selectFrom("ws_event_report_reasons")
        .select(["id", "program_id", "parent_id", "title"])
        .execute(),
      existingKey: errChildKey,
      offset: OFFSET_SMALL,
      toRow: (r, id) => ({ ...r, id }),
    })
    log(
      `master: ${entityMap.size} entities, ${mwMap.size} materials, ${activityMap.size} activities, ${emaRows.length} entity-material relations`
    )

    // ---------- dummy transactional data ----------
    for (const table of DUMMY_TABLES) {
      await db
        .deleteFrom(table)
        .where("id", ">=", DUMMY_ID_BASE)
        .where("id", "<", DUMMY_ID_END)
        .execute()
    }
    const nodes: DummyNode[] = snapshot.nodes.map((n: Row) => ({
      ew: mustGet(ewMap, n.ew_id, "entity workspace"),
      level: n.level,
      parentEw: n.parent_ew_id
        ? mustGet(ewMap, n.parent_ew_id, "parent entity workspace")
        : null,
    }))
    const parentOf = new Map<number, number>()
    for (const r of relations)
      parentOf.set(r.child_material_id, r.parent_material_id)
    const mwByGlobal = new Map<number, number>()
    for (const r of mwRows) mwByGlobal.set(r.material_id, mwMap.get(r.id)!)
    const manufacturersOf = new Map<number, number[]>()
    for (const r of mmRows)
      manufacturersOf.set(r.material_id, [
        ...(manufacturersOf.get(r.material_id) ?? []),
        r.manufacture_id,
      ])
    const materials: DummyMaterial[] = snapshot.material_workspaces
      .map((r: Row) => {
        const source = snapshot.materials.find(
          (m: Row) => m.id === r.material_id
        )
        const global = materialMap.get(r.material_id)!
        const parentGlobal = parentOf.get(global)
        return {
          mw: mwMap.get(r.id)!,
          parentMw: parentGlobal
            ? (mwByGlobal.get(parentGlobal) ?? null)
            : null,
          name: source?.name ?? "",
          perPack: Math.max(
            1,
            Number(source?.consumption_unit_per_distribution_unit ?? 1)
          ),
          manufacturers: manufacturersOf.get(mwMap.get(r.id)!) ?? [],
          level: source?.material_level_id,
        }
      })
      .filter((m: Row) => m.level === 3)
    const activityByCode = (code: string) =>
      snapshot.activities.find((a: Row) => a.code === code)
    const activities: DummyActivity[] = [
      { code: "rutin", materialLimit: 20, activeMonths: [] },
      { code: "bias", materialLimit: 6, activeMonths: [7, 8, 10] },
    ]
      .filter((a) => activityByCode(a.code))
      .map((a) => ({
        ...a,
        id: mustGet(activityMap, activityByCode(a.code).id, "activity"),
      }))
    const profile = snapshot.volume_profile
      .filter(
        (p: Row) =>
          ewMap.has(p.entity_id) &&
          mwMap.has(p.material_id) &&
          activityMap.has(p.activity_id)
      )
      .map((p: Row) => ({
        ew: ewMap.get(p.entity_id)!,
        mw: mwMap.get(p.material_id)!,
        activityId: activityMap.get(p.activity_id)!,
        monthlyOut: Number(p.monthly_out),
        monthlyCons: Number(p.monthly_cons),
      }))
    const existingEa = await idsWhere(
      db,
      "ws_entity_activities",
      "entity_id",
      ewIds,
      ["id", "entity_id", "activity_id"]
    )
    const existingEma = await idsWhere(
      db,
      "ws_entity_material_activities",
      "entity_id",
      ewIds,
      ["entity_id", "material_id", "activity_id"]
    )
    const existingCv = await idsWhere(
      db,
      "ws_customer_vendors",
      "customer_id",
      ewIds,
      ["customer_id", "vendor_id", "program_id"]
    )

    const orderStatuses = await db
      .selectFrom("ws_order_statuses")
      .select(["id", "name"])
      .execute()
    const orderTypes = await db
      .selectFrom("ws_order_types")
      .select(["id", "name"])
      .execute()
    const stockQuality = await db
      .selectFrom("ws_stock_qualities")
      .select("id")
      .orderBy("id")
      .executeTakeFirst()
    const orderStockStatus = await db
      .selectFrom("ws_order_stock_statuses")
      .select(["id", "name"])
      .execute()
    const reasonFor = (type: number, title: string) =>
      reasons.find(
        (r) =>
          Number(r.transaction_type_id) === type &&
          norm(r.title) === norm(title)
      )?.id
    const discard = typeByTitle("Pembuangan")
    const addStock = typeByTitle("Add Stock")
    const central = budgetSources.find((b) => norm(b.name) === "APBN")
    const fallbackMfw =
      mfwMap.get(
        snapshot.manufactures.find((m: Row) => norm(m.name) === "BIOFARMA")?.id
      ) ?? manufacturersOf.values().next().value?.[0]

    const dummy = generateDummy({
      nodes,
      materials,
      profile,
      activities,
      entityActivityIds: new Map(
        existingEa.map((r) => [`${r.entity_id}|${r.activity_id}`, Number(r.id)])
      ),
      entityMaterialActivities: new Set(
        existingEma.map(
          (r) => `${r.entity_id}|${r.material_id}|${r.activity_id}`
        )
      ),
      customerVendors: new Set(
        existingCv
          .filter((r) => Number(r.program_id) === wsId)
          .map((r) => `${r.customer_id}|${r.vendor_id}`)
      ),
      programId: wsId,
      ids: {
        txType: {
          stockCount: typeByTitle("Stock Count"),
          out: typeByTitle("Pengeluaran"),
          in: typeByTitle("Penerimaan"),
          discard,
          addStock,
          consumption: typeByTitle("Konsumsi"),
        },
        orderStatus: {
          pending: lookup(
            orderStatuses,
            "name",
            "pending",
            "ws_order_statuses"
          ),
          confirmed: lookup(
            orderStatuses,
            "name",
            "confirmed",
            "ws_order_statuses"
          ),
          allocated: lookup(
            orderStatuses,
            "name",
            "allocated",
            "ws_order_statuses"
          ),
          shipped: lookup(
            orderStatuses,
            "name",
            "shipped",
            "ws_order_statuses"
          ),
          fulfilled: lookup(
            orderStatuses,
            "name",
            "fulfilled",
            "ws_order_statuses"
          ),
        },
        orderType: {
          request: lookup(orderTypes, "name", "request", "ws_order_types"),
          distribution: lookup(
            orderTypes,
            "name",
            "distribution",
            "ws_order_types"
          ),
        },
        addStockReason: reasonFor(addStock, "Lainnya") ?? null,
        discardReasons: ["Pecah", "Rusak", "Kedaluwarsa/ED", "Beku"]
          .map((t) => reasonFor(discard, t))
          .filter((x): x is number => !!x)
          .map(Number),
        budgetSourceCentral: central
          ? (bswMap.get(
              snapshot.budget_source_workspaces.find(
                (b: Row) => norm(b.budget_source_name) === "APBN"
              )?.id
            ) ?? null)
          : null,
        stockQuality: stockQuality ? Number(stockQuality.id) : null,
        orderStockStatus: orderStockStatus.length
          ? lookup(orderStockStatus, "name", "vvma", "ws_order_stock_statuses")
          : null,
        fallbackManufacturer: Number(fallbackMfw),
      },
      userId: user,
      start,
      end,
      seed: options.seed ?? 960,
      idBase: DUMMY_ID_BASE,
    })

    await insertChunked(db, "ws_entity_activities", dummy.entityActivities)
    await insertChunked(
      db,
      "ws_entity_material_activities",
      dummy.entityMaterialActivities
    )
    await insertChunked(db, "ws_customer_vendors", dummy.customerVendors)
    await insertChunked(
      db,
      "ws_customer_vendor_activities",
      dummy.customerVendorActivities
    )
    await insertChunked(db, "ws_batches", dummy.batches)
    await insertChunked(db, "ws_stocks", dummy.stocks)
    await insertChunked(db, "ws_orders", dummy.orders)
    await insertChunked(db, "ws_order_item_stocks", dummy.orderItems)
    await insertChunked(db, "ws_order_histories", dummy.orderHistories)
    await insertChunked(db, "ws_transactions", dummy.transactions)
    log(
      `dummy ${start.toISOString().slice(0, 10)}..${end.toISOString().slice(0, 10)}: ${JSON.stringify(dummy.summary)}`
    )
    const users = await upsertSeedUsers(
      db,
      wsId,
      buildSeedUsers(
        snapshot.nodes.map((n: Row) => ({
          entityId: mustGet(entityMap, n.entity_id, "entity"),
          level: n.level,
          name:
            snapshot.entities.find((e: Row) => e.id === n.entity_id)?.name ??
            "",
        }))
      ),
      process.env.SEED_USER_PASSWORD
    )
    log(
      `users: ${users.created} created, ${users.total} entity accounts for program ${wsId}`
    )
    return { workspaceId: wsId, summary: dummy.summary }
  })
  // Keycloak lives outside the database transaction
  const kc = await syncKeycloakUsers(
    database,
    result.workspaceId,
    process.env.SEED_USER_PASSWORD,
    process.env.AUTH_URL,
    log
  )
  return { ...result, keycloak: kc }
}
