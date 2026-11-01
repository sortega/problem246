import { makeRng, randInt } from './rng'
import { key, START, type Triple } from './types'

/**
 * Triples the quiz may ask about: the shapes people tend to think in
 * (steps, multiples, doublings) plus plain random ones, in both directions.
 */
function buildPool(): Triple[] {
  const rng = makeRng(246)
  const out: Triple[] = []
  for (let a = 1; a <= 20; a++) {
    for (const d of [1, 2, 3, 4, 5, 10, 25]) out.push([a, a + d, a + 2 * d], [a + 2 * d, a + d, a])
    out.push([a, 2 * a, 3 * a], [a, 2 * a, 4 * a], [3 * a, 2 * a, a], [a, a, a])
  }
  for (let i = 0; i < 300; i++) {
    const t = [randInt(rng, 1, 60), randInt(rng, 1, 60), randInt(rng, 1, 60)] as const
    out.push(t, [...t].sort((x, y) => x - y) as unknown as Triple)
  }
  for (let i = 0; i < 60; i++) {
    const a = randInt(rng, 1, 30)
    const b = a + randInt(rng, 1, 30)
    out.push([a, b, b + randInt(rng, 20, 90)], [a, b, b], [a, a, b], [b, a, b + 1])
  }
  out.push(
    [1, 2, 3], [-6, -4, -2], [-5, 0, 5], [-3, 7, 11], [0, 1, 100],
    [1, 2, 1000], [3, 5, 4], [10, 1, 20], [9, 7, 11], [100, 99, 98], [5, 3, 1],
  )
  const seen = new Set([key(START)])
  return out.filter(t => !seen.has(key(t)) && (seen.add(key(t)), true))
}

export const POOL: readonly Triple[] = buildPool()

/** Rough "how hard is this to read" score: small positive numbers are nicer. */
export function complexity(t: Triple): number {
  const negative = t.some(x => x < 0) ? 0.3 : 0
  return Math.max(...t.map(Math.abs)) / 100 + negative
}
