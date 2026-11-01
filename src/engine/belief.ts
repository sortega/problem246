import { HYPOTHESES, TRUTH_ID, type Hypothesis } from './hypotheses'
import { makeRng, randInt } from './rng'
import { START, type Probe, type Triple } from './types'

export interface Belief {
  hypothesis: Hypothesis
  /** Still consistent with every answer the user has seen. */
  alive: boolean
  /** Normalised posterior that this is what the user believes (0 when dead). */
  weight: number
}

/** Fraction of "typical" triples a hypothesis accepts, used for the size principle. */
const SIZES: ReadonlyMap<string, number> = (() => {
  const rng = makeRng(1960)
  const sample: Triple[] = Array.from({ length: 20000 }, () => [
    randInt(rng, 0, 50), randInt(rng, 0, 50), randInt(rng, 0, 50),
  ])
  return new Map(HYPOTHESES.map(h => {
    const hits = sample.filter(h.test).length
    return [h.id, (hits + 1) / (sample.length + 2)]
  }))
})()

/** How strongly people pick triples they expect to fit (Klayman & Ha's positive test strategy). */
const P_POSITIVE_TEST = 0.85
/** Softens the size principle so a couple of probes don't make the posterior absolute. */
const SIZE_TEMPER = 0.5

/**
 * Posterior over what the user believes, given the triples they chose.
 * A hypothesis dies when it contradicts an answer they saw. Among the survivors,
 * narrow rules that fit every probe the user tried get the most weight.
 */
export function beliefs(probes: readonly Probe[]): Belief[] {
  const seen: Probe[] = [{ triple: START, awesome: true }, ...probes]
  const raw = HYPOTHESES.map(h => {
    const alive = seen.every(p => h.test(p.triple) === p.awesome)
    if (!alive) return { hypothesis: h, alive, weight: 0 }
    const size = SIZES.get(h.id)!
    let weight = h.prior
    for (const p of probes) {
      weight *= h.test(p.triple)
        ? P_POSITIVE_TEST / size ** SIZE_TEMPER
        : (1 - P_POSITIVE_TEST) / (1 - size) ** SIZE_TEMPER
    }
    return { hypothesis: h, alive, weight }
  })
  const total = raw.reduce((s, b) => s + b.weight, 0)
  return raw.map(b => ({ ...b, weight: b.weight / total }))
    .sort((x, y) => y.weight - x.weight)
}

export const aliveWrong = (bs: readonly Belief[]) =>
  bs.filter(b => b.alive && b.hypothesis.id !== TRUTH_ID)
