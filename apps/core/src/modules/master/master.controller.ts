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

    // Level metadata for LocationPicker: depth (array length) + label/
    // placeholder per level, resolved server-side via c.var.t in the
    // request's language -- the frontend has no locale lookup of its own
    // for these strings, it just renders whatever this returns.
    router.get("/locations/levels", async (c) => {
      const levels = await this.module.getLocationLevels(c)
      return c.json(levels, 200)
    })

    // Given a set of (typically leaf) location ids, returns every ancestor
    // {id, name, level} needed to re-seed a LocationPicker's per-level
    // dropdown labels -- used when a page reload only has raw ids to work
    // with (e.g. restored from a URL query param) and no label/level data.
    router.get("/locations/ancestors", async (c) => {
      const idsParam = c.req.query("ids") ?? ""
      const ids = idsParam
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id))

      const ancestors = await this.module.getLocationAncestors(c, ids)
      return c.json(ancestors, 200)
    })

    router.get("/roles", async (c) => {
      const list = await this.module.getRoles(c)
      return c.json({ list }, 200)
    })

    return router
  }
}
