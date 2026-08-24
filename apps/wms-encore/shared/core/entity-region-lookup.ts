// Resolves an entity's province/regency/district *names* — the last piece
// of the getEntityDetail denormalization gap (see entity-user-lookup.ts's
// header comment for the name/entity half of this). apps/core stores
// entities.province_id/regency_id/sub_district_id as a region's numeric id,
// stringified (confirmed against apps/core/src/modules/entity/entity.module.ts's
// `row.ProvinceId?.toString()`) — not a code — so resolving the name is a
// plain findRegionById lookup, once the string is parsed back to a number.
import { findRegionById } from "../../core/region/region.repository";

export interface EntityRegionNames {
  provinceId?: number;
  provinceName?: string;
  regencyId?: number;
  regencyName?: string;
  districtId?: number;
  districtName?: string;
}

export async function getEntityRegionNames(entity: {
  provinceId?: string;
  regencyId?: string;
  subDistrictId?: string;
} | null | undefined): Promise<EntityRegionNames> {
  if (!entity) return {};

  const provinceId = entity.provinceId ? Number(entity.provinceId) : undefined;
  const regencyId = entity.regencyId ? Number(entity.regencyId) : undefined;
  const districtId = entity.subDistrictId ? Number(entity.subDistrictId) : undefined;

  const [province, regency, district] = await Promise.all([
    provinceId ? findRegionById(provinceId) : null,
    regencyId ? findRegionById(regencyId) : null,
    districtId ? findRegionById(districtId) : null,
  ]);

  return {
    provinceId,
    provinceName: province?.name,
    regencyId,
    regencyName: regency?.name,
    districtId,
    districtName: district?.name,
  };
}
