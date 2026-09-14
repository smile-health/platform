import { sql } from "kysely"

export interface LocationHierarchyNode {
  id: number
  name: string
  level: number
}

// Builds a JSON_ARRAYAGG(...) SQL fragment returning the full ancestor chain
// (root -> leaf, ordered by level) of the `locations` row joined as
// `locAlias` — i.e. the alias used for `locations.id = <entity>.location_id`
// in a `#joinLocationHierarchy`-style join. Relies on `locations.path` being
// a materialized "id#id#id" root-to-self ancestor chain.
//
// Intended to be selected alongside the existing flat
// province_id/regency_id/sub_district_id/village_id-style aliases (which
// stay as deprecated fields) to additionally expose a generic
// `locations: {id, name, level}[]` field. Safe to use in both single-row
// and list/aggregate queries — it's a correlated scalar subquery, not a
// join, so it doesn't fan out rows or require GROUP BY handling.
export function locationHierarchyJsonAgg(locAlias = "loc") {
  const path = sql.ref(`${locAlias}.path`)

  return sql<LocationHierarchyNode[] | null>`(
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', x.id, 'name', x.name, 'level', x.level))
    FROM (
      SELECT a.id, a.name, a.level
      FROM locations a
      WHERE FIND_IN_SET(a.id, REPLACE(${path}, '#', ','))
      ORDER BY a.level
    ) x
  )`
}
