/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/common/infrastructure/database/index.js"
import app from "@/server.js"
import { afterAll, describe, expect, it } from "vitest"
import { createUsers } from "./seeders/users.js"
import { createToken } from "./utils/auth.js"

const NON_SUPERADMIN_ROLE = 4 // USER_ROLE.OPERATOR

const call = (path: string, init: RequestInit = {}, token = createToken()) =>
  app.fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

const seedAuditLog = async (overrides: Record<string, unknown> = {}) => {
  const result = await db
    .insertInto("audit_logs")
    .values({
      actor_id: 1,
      actor_role: "SUPERADMIN",
      action: "create",
      module: "material",
      service: "core",
      entity_id: 1,
      metadata: JSON.stringify({
        before: null,
        after: { name: "Paracetamol" },
      }),
      ip: "127.0.0.1",
      ...overrides,
    })
    .executeTakeFirst()

  return Number(result.insertId)
}

describe("GET /audit-logs", () => {
  it("returns a paginated list for a superadmin", async () => {
    await seedAuditLog({ module: "material-list" })

    const response = await call("/audit-logs?module=material-list")
    const body = (await response.json()) as any

    expect(response.status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty("module", "material-list")
    expect(body.data[0]).toHaveProperty("service", "core")
    expect(body.data[0]).toHaveProperty("actor_name")
  })

  it("rejects a non-superadmin with 403", async () => {
    const response = await call(
      "/audit-logs",
      {},
      createToken({ role: NON_SUPERADMIN_ROLE })
    )
    expect(response.status).toBe(403)
  })

  it("returns an empty list for a filter that matches nothing", async () => {
    const response = await call("/audit-logs?module=module-that-does-not-exist")
    const body = (await response.json()) as any

    expect(response.status).toBe(200)
    expect(body.data).toEqual([])
    expect(body.total_item).toBe(0)
  })

  it("filters by actor_id, service and action", async () => {
    const user = await createUsers()
    await seedAuditLog({
      actor_id: user.id,
      module: "material-actor-filter",
      service: "main",
      action: "export",
    })

    const response = await call(
      `/audit-logs?actor_id=${user.id}&module=material-actor-filter&service=main&action=export`
    )
    const body = (await response.json()) as any

    expect(response.status).toBe(200)
    expect(body.data.length).toBe(1)
    expect(body.data[0].actor_id).toBe(String(user.id))
  })

  it("returns rows without an actor", async () => {
    await seedAuditLog({ actor_id: null, module: "no-actor" })
    const response = await call("/audit-logs?module=no-actor")
    const body = (await response.json()) as any

    expect(response.status).toBe(200)
    expect(body.data[0].actor_id).toBeNull()
    expect(body.data[0].actor_name).toBe("")
  })
})

describe("/audit-logs/settings", () => {
  it("GET returns the retention window", async () => {
    const response = await call("/audit-logs/settings")
    const body = (await response.json()) as any

    expect(response.status).toBe(200)
    expect(typeof body.retention_days).toBe("number")
  })

  it("PUT updates and returns the retention window", async () => {
    const response = await call("/audit-logs/settings", {
      method: "PUT",
      body: JSON.stringify({ retention_days: 14 }),
    })
    expect(response.status).toBe(200)
    expect(((await response.json()) as any).retention_days).toBe(14)

    const again = await call("/audit-logs/settings")
    expect(((await again.json()) as any).retention_days).toBe(14)

    await call("/audit-logs/settings", {
      method: "PUT",
      body: JSON.stringify({ retention_days: 7 }),
    })
  })

  it.each([0, 91, 1.5])("PUT rejects retention_days=%p", async (v) => {
    const response = await call("/audit-logs/settings", {
      method: "PUT",
      body: JSON.stringify({ retention_days: v }),
    })
    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(response.status).toBeLessThan(500)
  })

  it("rejects non-superadmin on GET and PUT with 403", async () => {
    const token = createToken({ role: NON_SUPERADMIN_ROLE })
    expect((await call("/audit-logs/settings", {}, token)).status).toBe(403)
    expect(
      (
        await call(
          "/audit-logs/settings",
          { method: "PUT", body: JSON.stringify({ retention_days: 5 }) },
          token
        )
      ).status
    ).toBe(403)
  })
})

afterAll(async () => {
  await db.destroy()
})
