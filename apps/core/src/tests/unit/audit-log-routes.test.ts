import { describe, expect, it } from "vitest"
import {
  AUDIT_BEFORE_TABLES,
  AUDITED_ROUTES,
} from "@/modules/audit-log/audit-log.constants.js"

const beforeRoute = (module: string) =>
  AUDITED_ROUTES.find((route) => route.module === module)?.before

const idFrom = (module: string, path: string) =>
  beforeRoute(module)?.idFrom.exec(path)?.[1]

describe("AUDITED_ROUTES before lookup", () => {
  it("captures the row id for update, status and delete paths", () => {
    expect(idFrom("material", "/materials/12")).toBe("12")
    expect(idFrom("material", "/materials/12/status")).toBe("12")
    expect(idFrom("user", "/users/3/status")).toBe("3")
    expect(idFrom("executive_account", "/executive/account/9")).toBe("9")
    expect(idFrom("manufacture", "/manufactures/4")).toBe("4")
  })

  it("does not capture ids of nested resources or id-less paths", () => {
    expect(idFrom("program", "/programs/1/activities/2")).toBeUndefined()
    expect(idFrom("program", "/programs/1")).toBe("1")
    expect(idFrom("executive_account", "/executive/account/profile")).toBeUndefined()
    expect(idFrom("material", "/materials")).toBeUndefined()
  })

  it("maps program to workspaces and exposes only configured tables", () => {
    expect(beforeRoute("program")?.table).toBe("workspaces")
    expect(AUDIT_BEFORE_TABLES.has("materials")).toBe(true)
    expect(AUDIT_BEFORE_TABLES.has("audit_logs")).toBe(false)
  })
})
