/** Deterministic PRNG (mulberry32) so the dummy data is identical on every run. */
export interface Rng {
  next(): number
  int(min: number, max: number): number
  float(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  chance(probability: number): boolean
  uuid(): string
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1))
  const hex = (n: number) =>
    Array.from({ length: n }, () => int(0, 15).toString(16)).join("")
  return {
    next,
    int,
    float: (min, max) => min + next() * (max - min),
    pick: (items) => {
      if (items.length === 0) throw new Error("pick from empty list")
      return items[int(0, items.length - 1)] as (typeof items)[number]
    },
    chance: (p) => next() < p,
    uuid: () =>
      `${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + int(0, 3)).toString(16)}${hex(3)}-${hex(12)}`,
  }
}
