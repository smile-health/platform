export interface ResolvedId {
  id: number
  /** true when the row already exists in the target database (nothing to insert) */
  exists: boolean
}

export interface ResolveOptions<T> {
  id: (row: T) => number
  key: (row: T) => string
  /** natural key of every existing row in the target, by id */
  existingById: Map<number, string>
  /** id of every existing row in the target, by natural key */
  existingByKey: Map<string, number>
  /** shift applied when the source id is already taken by a different row */
  offset: number
}

/**
 * Map source (SMILE prod) ids to target (SMILE Health) ids.
 *
 * 1. Natural key already present in the target -> reuse that row.
 * 2. Source id free in the target -> keep the source id.
 * 3. Source id taken by another row -> source id + offset.
 */
export function resolveIds<T>(
  rows: readonly T[],
  opts: ResolveOptions<T>
): Map<number, ResolvedId> {
  const result = new Map<number, ResolvedId>()
  const claimed = new Map<number, string>()
  for (const row of rows) {
    const sourceId = opts.id(row)
    const key = opts.key(row)
    if (result.has(sourceId)) continue
    const existing = opts.existingByKey.get(key)
    if (existing !== undefined) {
      result.set(sourceId, { id: existing, exists: true })
      continue
    }
    const candidates = [sourceId, sourceId + opts.offset]
    const free = candidates.find((candidate) => {
      const owner = opts.existingById.get(candidate) ?? claimed.get(candidate)
      return owner === undefined
    })
    if (free === undefined) {
      throw new Error(
        `Cannot place source id ${sourceId} (${key}): ids ${candidates.join(", ")} are taken`
      )
    }
    claimed.set(free, key)
    result.set(sourceId, { id: free, exists: false })
  }
  return result
}

export function mustGet<K, V>(map: Map<K, V>, key: K, what: string): V {
  const value = map.get(key)
  if (value === undefined) throw new Error(`Missing ${what}: ${String(key)}`)
  return value
}
