import { sql, type RawBuilder } from "kysely"

/**
 * Level di tabel `locations`: 0 provinsi, 1 kabupaten/kota, 2 kecamatan,
 * 3 desa/kelurahan.
 */
export const LOCATION_LEVEL = {
  PROVINCE: 0,
  REGENCY: 1,
  SUB_DISTRICT: 2,
  VILLAGE: 3,
} as const

export type LocationLevel = (typeof LOCATION_LEVEL)[keyof typeof LOCATION_LEVEL]

/**
 * Id leluhur di `level` tertentu dari baris `locations` ber-alias `locAlias`.
 *
 * `locations.path` berisi id dari akar sampai diri sendiri, dipisah '#'
 * (mis. "11#1101#110101"). Hasilnya NULL kalau lokasinya lebih dangkal dari
 * `level` atau entitas tidak punya lokasi. Tipenya string supaya sama dengan
 * kolom lama ws_entities.province_id/regency_id/sub_district_id/village_id
 * yang digantikan `location_id`.
 */
export function locationAncestorId(
  locAlias: string,
  level: LocationLevel
): RawBuilder<string | null> {
  const path = sql.ref(`${locAlias}.path`)
  const depth = sql.ref(`${locAlias}.level`)

  return sql<string | null>`CASE WHEN ${depth} >= ${sql.lit(level)} THEN SUBSTRING_INDEX(SUBSTRING_INDEX(${path}, '#', ${sql.lit(level + 1)}), '#', -1) ELSE NULL END`
}
