import { LOCATION } from "@/common/constants/location.js"
import { zValidator } from "@hono/zod-validator"
import { ValidationError } from "@smile-health/lib/error.js"
import { Hono } from "hono"
import { MasterModule } from "./master.module.js"
import { LocationPageable, Pageable } from "./master.schema.js"

export class MasterController {
  constructor(private readonly module: MasterModule) {}

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/provinces",
      zValidator("query", Pageable, (result) => {
        if (!result.success) {
          throw new ValidationError(result.error.issues[0]?.message)
        }
      }),
      async (c) => {
        const q = c.req.valid("query")
        const list = await this.module.getLocations(c, {
          ...q,
          level: LOCATION.PROVINCE,
          parent_id: [0],
        })
        if (list.data && list.data.length == 0) {
          return c.body(null, 204)
        }

        return c.json(list, 200)
      }
    )

    router.get(
      "/regencies",
      zValidator("query", Pageable, (result) => {
        if (!result.success) {
          throw new ValidationError(result.error.issues[0]?.message)
        }
      }),
      async (c) => {
        const q = c.req.valid("query")
        const list = await this.module.getLocations(c, {
          ...q,
          level: LOCATION.REGENCY,
        })
        if (list.data && list.data.length == 0) {
          return c.body(null, 204)
        }
        return c.json(list, 200)
      }
    )

    router.get(
      "/subdistricts",
      zValidator("query", Pageable, (result) => {
        if (!result.success) {
          throw new ValidationError(result.error.issues[0]?.message)
        }
      }),
      async (c) => {
        const q = c.req.valid("query")
        const list = await this.module.getLocations(c, {
          ...q,
          level: LOCATION.SUBDISTRICT,
        })
        if (list.data && list.data.length == 0) {
          return c.body(null, 204)
        }
        return c.json(list, 200)
      }
    )

    router.get(
      "/villages",
      zValidator("query", Pageable, (result) => {
        if (!result.success) {
          throw new ValidationError(result.error.issues[0]?.message)
        }
      }),
      async (c) => {
        const q = c.req.valid("query")
        const list = await this.module.getLocations(c, {
          ...q,
          level: LOCATION.VILLAGE,
        })
        if (list.data && list.data.length == 0) {
          return c.body(null, 204)
        }
        return c.json(list, 200)
      }
    )

    // Generic replacement for /provinces, /regencies, /subdistricts,
    // /villages: one endpoint over the same self-referencing `locations`
    // table, with `level` taken from the query instead of hardcoded per
    // route. The 4 fixed-level routes above are kept for now since other
    // callers may still use them; new frontend code (LocationPicker) should
    // call this one instead.
    router.get(
      "/locations",
      zValidator("query", LocationPageable, (result) => {
        if (!result.success) {
          throw new ValidationError(result.error.issues[0]?.message)
        }
      }),
      async (c) => {
        const q = c.req.valid("query")
        const list = await this.module.getLocations(c, {
          ...q,
          level: q.level ?? LOCATION.PROVINCE,
          parent_id: q.parent_id ?? [0],
        })
        if (list.data && list.data.length == 0) {
          return c.body(null, 204)
        }
        return c.json(list, 200)
      }
    )

    router.get("/roles", async (c) => {
      const list = await this.module.getRoles(c)
      return c.json({ list }, 200)
    })

    return router
  }
}
