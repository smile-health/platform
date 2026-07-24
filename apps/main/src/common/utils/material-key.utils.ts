/**
 * Centralized material key resolution utilities.
 *
 * Uses database-driven `material_key` lookups from ws_mp_material_target_config.
 * The key strings (e.g. "hb0", "bcg", "mr") match the `material_key` column values.
 *
 * No static code variation strings — all mappings come from the database.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core resolvers
// ─────────────────────────────────────────────────────────────────────────────

export function resolveMaterialId(
  materialKeyMap: Map<string, number>,
  key: string
): number {
  return materialKeyMap.get(key) ?? 0
}

export function resolveNonBiasMaterialIds(
  materialKeyMap: Map<string, number>
) {
  return {
    hb0Id: resolveMaterialId(materialKeyMap, "hb0"),
    bcgId: resolveMaterialId(materialKeyMap, "bcg"),
    polioId: resolveMaterialId(materialKeyMap, "polio"),
    ipvId: resolveMaterialId(materialKeyMap, "ipv"),
    pcvId: resolveMaterialId(materialKeyMap, "pcv"),
    dptId: resolveMaterialId(materialKeyMap, "dpt_hb_hib"),
    mrId: resolveMaterialId(materialKeyMap, "mr"),
    rotavirusId: resolveMaterialId(materialKeyMap, "rotavirus"),
    tdId: resolveMaterialId(materialKeyMap, "td"),
    hexId: resolveMaterialId(materialKeyMap, "heksavalen"),
    jeId: resolveMaterialId(materialKeyMap, "je"),
  }
}

export function resolveBiasMaterialIds(
  materialKeyMap: Map<string, number>
) {
  return {
    mrId: resolveMaterialId(materialKeyMap, "mr"),
    dtId: resolveMaterialId(materialKeyMap, "dt"),
    tdId: resolveMaterialId(materialKeyMap, "td"),
    hpvId: resolveMaterialId(materialKeyMap, "hpv"),
  }
}

export function resolveLogisticsIds(
  materialKeyMap: Map<string, number>
) {
  return {
    ads5mlId: resolveMaterialId(materialKeyMap, "ads_5ml"),
    ads05mlId: resolveMaterialId(materialKeyMap, "ads_05ml"),
    ads005mlId: resolveMaterialId(materialKeyMap, "ads_005ml"),
    sb25lId: resolveMaterialId(materialKeyMap, "sb_25l"),
    sb5lId: resolveMaterialId(materialKeyMap, "sb_5l"),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Formula config types & constants
// ─────────────────────────────────────────────────────────────────────────────

export type TargetCounts = { bbl: number; si: number; baduta: number; wus: number }
export type GradeCounts = { grade1: number; grade2: number; grade5Female: number; grade5Male: number }

export interface CalcConfigEntry<T> {
  getTarget: (c: T) => number
  formula: 'noBuffer' | 'withBuffer' | 'noTd'
  /** Logistics group for ADS/SB aggregation. Materials with the same group are summed together. */
  logisticsGroup?: string
}

/**
 * Formula config for NON-BIAS (routine immunization) materials.
 *
 * Adding new material_keys here is the ONLY code change needed
 * when a new non-bias vaccine type is introduced.
 * Variants of existing types are handled automatically via parent lookup.
 */
export const NON_BIAS_CALC_CONFIG: Record<string, CalcConfigEntry<TargetCounts>> = {
  hb0:         { getTarget: (c) => c.bbl, formula: 'noBuffer' },
  bcg:         { getTarget: (c) => c.bbl, formula: 'noBuffer', logisticsGroup: 'bcg' },
  bcg_2:       { getTarget: (c) => c.bbl, formula: 'noBuffer', logisticsGroup: 'bcg' },
  bcg_3:       { getTarget: (c) => c.bbl, formula: 'noBuffer', logisticsGroup: 'bcg' },
  bcg_4:       { getTarget: (c) => c.bbl, formula: 'noBuffer', logisticsGroup: 'bcg' },
  polio:       { getTarget: (c) => c.si + c.baduta, formula: 'withBuffer' },
  ipv:         { getTarget: (c) => c.si * 2, formula: 'withBuffer', logisticsGroup: 'ipv' },
  pcv:         { getTarget: (c) => c.si * 2 + c.baduta, formula: 'withBuffer', logisticsGroup: 'pcv' },
  dpt_hb_hib:  { getTarget: (c) => c.si * 3 + c.baduta, formula: 'withBuffer', logisticsGroup: 'dpt' },
  mr:          { getTarget: (c) => c.si + c.baduta, formula: 'withBuffer', logisticsGroup: 'mr' },
  rotavirus:   { getTarget: (c) => c.si * 3, formula: 'withBuffer' },
  td:          { getTarget: (c) => c.wus * 0.1, formula: 'noTd', logisticsGroup: 'td' },
  je:          { getTarget: (c) => c.si, formula: 'withBuffer' },
  heksavalen:  { getTarget: (c) => c.bbl, formula: 'noBuffer' },
}

/**
 * Formula config for BIAS (school-based immunization) materials.
 *
 * logisticsGroup is split by injection month:
 * - 'mr_aug' / 'hpv_aug' → August
 * - 'dt_nov' / 'td_nov' → November
 */
export const BIAS_CALC_CONFIG: Record<string, CalcConfigEntry<GradeCounts>> = {
  mr:  { getTarget: (c) => c.grade1, formula: 'noBuffer', logisticsGroup: 'mr_aug' },
  dt:  { getTarget: (c) => c.grade1, formula: 'noBuffer', logisticsGroup: 'dt_nov' },
  td:  { getTarget: (c) => c.grade2 + c.grade5Female + c.grade5Male, formula: 'noBuffer', logisticsGroup: 'td_nov' },
  hpv: { getTarget: (c) => c.grade5Female, formula: 'noBuffer', logisticsGroup: 'hpv_aug' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic vial need calculation (shared helper)
// ─────────────────────────────────────────────────────────────────────────────

export type VialNeedResult = { ip: number; vialNeed: number; materialKey: string }

/**
 * Build a reverse lookup: parentId → materialKey from materialKeyMap.
 */
export function buildParentIdToKeyMap(
  materialKeyMap: Map<string, number>
): Map<number, string> {
  const result = new Map<number, string>()
  for (const [key, id] of materialKeyMap.entries()) {
    result.set(id, key)
  }
  return result
}

/**
 * Dynamically calculate vial needs for ALL materials in utilizationRates.
 * Each material is matched to its material_key via parentId → materialKeyMap,
 * then the appropriate formula from calcConfig is applied.
 *
 * Returns Map<materialId, { ip, vialNeed, materialKey }>.
 * Adding new DB variants requires ZERO code changes.
 */
export function calculateVialNeedsDynamic<T>(
  calcConfig: Record<string, CalcConfigEntry<T>>,
  targetCounts: T,
  utilizationRates: { id: number; value: number | null }[],
  parentIdToKey: Map<number, string>,
  variantParentMap: Map<number, number | null>,
  calcFns: {
    noBuffer: (target: number, ip: number) => number
    withBuffer: (target: number, ip: number) => number
    noTd: (target: number, ip: number) => number
  }
): Map<number, VialNeedResult> {
  const results = new Map<number, VialNeedResult>()

  for (const rate of utilizationRates) {
    const parentId = variantParentMap.get(rate.id) ?? rate.id
    const materialKey = parentIdToKey.get(parentId)
    if (!materialKey) continue

    const config = calcConfig[materialKey]
    if (!config) continue

    const ip = Number(rate.value ?? 0)
    const target = config.getTarget(targetCounts)
    let vialNeed = 0

    switch (config.formula) {
      case 'noBuffer':
        vialNeed = calcFns.noBuffer(target, ip)
        break
      case 'withBuffer':
        vialNeed = calcFns.withBuffer(target, ip)
        break
      case 'noTd':
        vialNeed = calcFns.noTd(target, ip)
        break
    }

    results.set(rate.id, { ip, vialNeed, materialKey })
  }

  return results
}

/**
 * Aggregate vialNeed and doses (vialNeed * ip) by logistics group.
 */
export function aggregateByLogisticsGroup(
  vialNeedsMap: Map<number, VialNeedResult>,
  calcConfig: Record<string, CalcConfigEntry<unknown>>
): {
  getVialNeed: (group: string) => number
  getDoses: (group: string) => number
} {
  const groupAgg = new Map<string, { totalVialNeed: number; totalDoses: number }>()
  const seenKeys = new Set<string>()

  for (const [, data] of vialNeedsMap) {
    if (seenKeys.has(data.materialKey)) continue
    seenKeys.add(data.materialKey)

    const config = calcConfig[data.materialKey]
    const group = config?.logisticsGroup
    if (!group) continue

    const existing = groupAgg.get(group) ?? { totalVialNeed: 0, totalDoses: 0 }
    existing.totalVialNeed += data.vialNeed
    existing.totalDoses += data.vialNeed * data.ip
    groupAgg.set(group, existing)
  }

  return {
    getVialNeed: (group: string) => groupAgg.get(group)?.totalVialNeed ?? 0,
    getDoses: (group: string) => groupAgg.get(group)?.totalDoses ?? 0,
  }
}
