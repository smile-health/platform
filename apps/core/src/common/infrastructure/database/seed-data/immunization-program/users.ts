import bcrypt from "bcrypt"
import { randomUUID } from "crypto"
import type { Kysely } from "kysely"
import type { Level } from "./dummy.js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = Kysely<any>

/** All seeded entity accounts share this prefix so they never collide with real users. */
export const SEED_USERNAME_PREFIX = "imun_"
export const SEED_EMAIL_DOMAIN = "example.com"

/** Role per entity level (roles.name). Lastmile units hold no stock and get no account. */
export const ROLE_BY_LEVEL: Partial<Record<Level, string>> = {
  kemenkes: "Admin",
  provinsi: "Manager",
  kabkota: "Manager",
  puskesmas: "Operator",
}

export interface SeedEntity {
  entityId: number
  level: Level
  name: string
}

export interface SeedUser {
  username: string
  email: string
  firstname: string
  lastname: string
  roleName: string
  entityId: number
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

function usernameFor(entity: SeedEntity): string {
  const name = entity.name.toUpperCase().trim()
  if (entity.level === "kemenkes") return `${SEED_USERNAME_PREFIX}kemenkes`
  if (entity.level === "provinsi")
    return `${SEED_USERNAME_PREFIX}prov_${slug(name.replace(/^DINKES\s+PROV(INSI)?\.?\s*/, ""))}`
  if (entity.level === "kabkota") {
    const kota = /^DINKES\s+KOTA\b/.test(name)
    const rest = name.replace(/^DINKES\s+(KAB(UPATEN)?\.?|KOTA)\s*/, "")
    return `${SEED_USERNAME_PREFIX}${kota ? "kota" : "kab"}_${slug(rest)}`
  }
  return `${SEED_USERNAME_PREFIX}pkm_${slug(name.replace(/^PUSKESMAS\s*/, ""))}`
}

/** One account per stock-holding entity, deterministic and unique. */
export function buildSeedUsers(entities: SeedEntity[]): SeedUser[] {
  const used = new Set<string>()
  const users: SeedUser[] = []
  for (const entity of entities) {
    const roleName = ROLE_BY_LEVEL[entity.level]
    if (!roleName) continue
    let username = usernameFor(entity)
    if (used.has(username)) username = `${username}_${entity.entityId}`
    used.add(username)
    users.push({
      username,
      email: `${username}@${SEED_EMAIL_DOMAIN}`,
      firstname: roleName,
      lastname: entity.name,
      roleName,
      entityId: entity.entityId,
    })
  }
  return users
}

/** Add user_workspaces rows that are missing; existing rows are left untouched. */
export async function grantWorkspace(
  db: Db,
  workspaceId: number,
  userIds: number[]
) {
  if (!userIds.length) return 0
  const existing = new Set(
    (
      await db
        .selectFrom("user_workspaces")
        .select("user_id")
        .where("workspace_id", "=", workspaceId)
        .where("user_id", "in", userIds)
        .execute()
    ).map((r) => Number(r.user_id))
  )
  const rows = [...new Set(userIds)]
    .filter((id) => !existing.has(id))
    .map((user_id) => ({ user_id, workspace_id: workspaceId, status: 1 }))
  if (rows.length) await db.insertInto("user_workspaces").values(rows).execute()
  return rows.length
}

/** Insert missing seed users (database only) and give them the program. */
export async function upsertSeedUsers(
  db: Db,
  workspaceId: number,
  users: SeedUser[],
  password?: string
) {
  const roles = await db.selectFrom("roles").select(["id", "name"]).execute()
  const roleId = (name: string) => {
    const role = roles.find(
      (r) => String(r.name).toLowerCase() === name.toLowerCase()
    )
    if (!role) throw new Error(`role "${name}" not found`)
    return Number(role.id)
  }
  const existing = new Map(
    (
      await db
        .selectFrom("users")
        .select(["id", "username"])
        .where(
          "username",
          "in",
          users.map((u) => u.username)
        )
        .execute()
    ).map((r) => [String(r.username), Number(r.id)])
  )
  const hash = password ? await bcrypt.hash(password, 10) : null
  let created = 0
  for (const u of users) {
    if (existing.has(u.username)) continue
    const result = await db
      .insertInto("users")
      .values({
        username: u.username,
        email: u.email,
        firstname: u.firstname,
        lastname: u.lastname,
        role: roleId(u.roleName),
        entity_id: u.entityId,
        gender: 1,
        status: 1,
        view_only: 0,
        password: hash,
        user_uuid: randomUUID(),
      })
      .executeTakeFirstOrThrow()
    existing.set(u.username, Number(result.insertId))
    created += 1
  }
  await grantWorkspace(db, workspaceId, [...existing.values()])
  return { created, total: users.length }
}

/**
 * Create the Keycloak account (through auth-service) for seed users that do not
 * have one yet. Only `imun_*` users are touched: auth-service's POST /users
 * deletes and recreates an existing Keycloak user with the same username/email,
 * so it must never be called for real accounts.
 */
export async function syncKeycloakUsers(
  db: Db,
  workspaceId: number,
  password: string | undefined,
  authUrl: string | undefined,
  log: (msg: string) => void
) {
  if (!password || !authUrl) {
    log(
      "keycloak: skipped (set SEED_USER_PASSWORD and AUTH_URL to create login accounts)"
    )
    return { created: 0, skipped: true }
  }
  const users = await db
    .selectFrom("users as u")
    .innerJoin("roles as r", "r.id", "u.role")
    .select([
      "u.id",
      "u.username",
      "u.email",
      "u.firstname",
      "u.lastname",
      "u.user_uuid",
      "u.keycloak_uuid",
      "r.name as role_name",
    ])
    .where("u.username", "like", `${SEED_USERNAME_PREFIX}%`)
    .where("u.deleted_at", "is", null)
    .execute()
  let created = 0
  for (const u of users) {
    if (!String(u.username).startsWith(SEED_USERNAME_PREFIX)) continue
    if (u.keycloak_uuid) {
      const found = await fetch(`${authUrl}/users/${u.keycloak_uuid}`)
      if (found.ok) continue
    }
    const programs = (
      await db
        .selectFrom("user_workspaces")
        .select("workspace_id")
        .where("user_id", "=", u.id)
        .where("deleted_at", "is", null)
        .execute()
    ).map((r) => String(r.workspace_id))
    const response = await fetch(`${authUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: u.username,
        firstName: u.firstname,
        lastName: u.lastname ?? undefined,
        email: u.email,
        credentials: [{ temporary: false, type: "password", value: password }],
        attributes: {
          appUserId: u.user_uuid,
          programId: programs.length ? programs : [String(workspaceId)],
        },
        roles: [u.role_name],
        clients: [],
      }),
    })
    const body = (await response.json().catch(() => ({}))) as {
      id?: string
      message?: unknown
    }
    if (!response.ok || !body.id) {
      throw new Error(
        `keycloak: failed to create ${u.username}: ${response.status} ${JSON.stringify(body.message ?? body)}`
      )
    }
    await db
      .updateTable("users")
      .set({ keycloak_uuid: body.id })
      .where("id", "=", u.id)
      .execute()
    created += 1
  }
  log(
    `keycloak: ${created} account(s) created, ${users.length - created} already present`
  )
  return { created, skipped: false }
}
