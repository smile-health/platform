import { LOCATION } from "@/common/constants/location.js"
import { ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { RoleRepository } from "../role/role.repository.js"
import { MasterRepository } from "./master.repository.js"
import { TLocationPageable } from "./master.schema.js"

export class MasterModule {
  constructor(
    private readonly repository: MasterRepository,
    private readonly roleRepo: RoleRepository
  ) {}

  async getLocations(c: Context, param: TLocationPageable) {
    if (
      !param.parent_id &&
      (param.level == LOCATION.REGENCY ||
        param.level == LOCATION.SUBDISTRICT ||
        param.level == LOCATION.VILLAGE)
    ) {
      throw new ValidationError("parent_id is required")
    }

    return await this.repository.getLocations(c, param)
  }

  async getRoles(c: Context) {
    return await this.roleRepo.getRoles(c)
  }

  async getLocationAncestors(c: Context, ids: number[]) {
    return await this.repository.getAncestorsByIds(c, ids)
  }

  // Resolves each level's label/placeholder server-side via c.var.t (same
  // resolver every other translated field in this API already uses), so
  // the frontend never needs its own locale lookup for these strings --
  // it just displays whatever this endpoint already returned in the
  // request's language. Depth is the array's length, derived from the
  // data itself rather than a separate stored config value.
  async getLocationLevels(c: Context) {
    const maxLevel = await this.repository.getMaxLocationLevel(c)

    return Array.from({ length: maxLevel + 1 }, (_, level) => ({
      level,
      label: c.var.t(`location.${level}.label`),
      placeholder: c.var.t(`location.${level}.placeholder`),
    }))
  }
}
