import { AUDITED_ROUTES } from "@/modules/audit-log/audit-log.constants.js"
import { describe, expect, it } from "vitest"

const find = (method: string, path: string) =>
  AUDITED_ROUTES.find(
    (r) =>
      (r.methods ?? ["POST", "PUT", "PATCH", "DELETE"]).includes(method) &&
      r.match.test(path)
  )

describe("AUDITED_ROUTES", () => {
  it("records master-data writes with the module name", () => {
    expect(find("PUT", "/materials/12")?.module).toBe("material")
    expect(find("POST", "/users")?.module).toBe("user")
    expect(find("DELETE", "/executive/roles/2")?.module).toBe("executive_role")
    expect(find("POST", "/asset-vendor-types")?.module).toBe(
      "asset_vendor_type"
    )
  })

  it("does not record plain reads", () => {
    expect(find("GET", "/materials")).toBeUndefined()
    expect(find("GET", "/users/12")).toBeUndefined()
  })

  it("records export endpoints with action export", () => {
    for (const [m, p] of [
      ["GET", "/materials/xls"],
      ["GET", "/users/xls"],
      ["GET", "/coldstorage/5/export"],
      ["GET", "/annual-planning/group-targets/export"],
      ["POST", "/materials/export"],
      ["GET", "/export-histories/abc.xlsx/download"],
      ["POST", "/coldstorage/5/download"],
    ]) {
      const r = find(m, p)
      expect(r?.action, `${m} ${p}`).toBe("export")
      expect(r?.module).toBe("export")
    }
  })

  it("treats POST .../xls as an import, not an export", () => {
    expect(find("POST", "/materials/xls")?.action).not.toBe("export")
    expect(find("POST", "/users/xls")?.module).not.toBe("export")
  })

  it("does not treat templates or export history listing as exports", () => {
    expect(find("GET", "/materials/xls-template")).toBeUndefined()
    expect(find("GET", "/export-histories")).toBeUndefined()
  })

  it("is not caught by unlisted paths", () => {
    expect(find("POST", "/notifications")).toBeUndefined()
    expect(find("POST", "/account/change-password")).toBeUndefined()
  })
})
