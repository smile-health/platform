import { describe, expect, it } from "vitest"
import {
  AUDIT_BEFORE_TABLES,
  AUDITED_ROUTES,
} from "@/modules/audit-log/audit-log.constants.js"

const find = (method: string, path: string) =>
  AUDITED_ROUTES.find(
    (route) =>
      (route.methods ?? ["POST", "PUT", "PATCH", "DELETE"]).includes(method) &&
      route.match.test(path)
  )

describe("main AUDITED_ROUTES", () => {
  it("records order status actions with a tracked status", () => {
    for (const action of ["allocate", "cancel", "confirm", "fulfilled", "pending", "ship", "validate"]) {
      const route = find("PUT", `/orders/12/${action}`)
      expect(route?.module).toBe("order")
      expect(route?.action).toBe("update_status")
      expect(route?.before?.idFrom.exec(`/orders/12/${action}`)?.[1]).toBe("12")
      expect(route?.before?.track).toEqual(["order_status_id"])
    }
  })

  it("records order creation endpoints and keeps comments separate", () => {
    for (const path of ["/orders/request", "/orders/relocation", "/orders/return", "/orders/distribution", "/orders/central-distribution"]) {
      expect(find("POST", path)).toMatchObject({ module: "order", action: "create" })
    }
    expect(find("POST", "/orders/12/comments")?.module).toBe("order_comment")
    expect(find("PUT", "/orders/12/order-item-stocks")?.module).toBe("order_item_stock")
    expect(find("POST", "/orders/12/retry-integration-logs")).toBeUndefined()
  })

  it("only lets loadBefore read configured tables", () => {
    expect([...AUDIT_BEFORE_TABLES].sort()).toEqual(["ws_entity_material_activities", "ws_orders"])
  })

  it("captures entity material ids only from the DELETE path", () => {
    const route = find("DELETE", "/entities/5/materials/88")
    expect(route?.before?.idFrom.exec("/entities/5/materials/88")?.[1]).toBe("88")
    expect(route?.before?.idFrom.exec("/entities/5/materials")).toBeNull()
  })
})
