import type { Belief } from './belief'
import { HYPOTHESES, isAwesome, TRUTH, type Hypothesis } from './hypotheses'
import { complexity, POOL } from './pool'
import { START, type Probe, type Triple } from './types'

export const countWrong = (quiz: readonly Triple[], answers: readonly boolean[]) =>
  quiz.filter((t, i) => answers[i] !== isAwesome(t)).length

export interface Match {
  hypothesis: Hypothesis
  mismatches: number
}

/** The rule that best explains the user's quiz answers; ties go to the likelier belief. */
export function bestMatch(quiz: readonly Triple[], answers: readonly boolean[], bs: readonly Belief[]): Match {
  const weight = new Map(bs.map(b => [b.hypothesis.id, b.weight + (b.alive ? 1 : 0)]))
  const scored = HYPOTHESES.map(h => ({
    hypothesis: h,
    mismatches: quiz.filter((t, i) => h.test(t) !== answers[i]).length,
  }))
  scored.sort((x, y) => x.mismatches - y.mismatches
    || (weight.get(y.hypothesis.id) ?? 0) - (weight.get(x.hypothesis.id) ?? 0))
  return scored[0]!
}

export interface Counterexample {
  triple: Triple
  /** True when the triple is awesome but outside the user's rule: a "look into the dark" probe. */
  awesome: boolean
}

/** The simplest triple on which the user's rule and the true rule disagree. */
export function counterexample(h: Hypothesis): Counterexample | undefined {
  const differ = POOL.filter(t => h.test(t) !== isAwesome(t))
    .sort((x, y) => complexity(x) - complexity(y))
  const t = differ.find(isAwesome) ?? differ[0]
  return t && { triple: t, awesome: isAwesome(t) }
}

export interface TimelineEntry {
  probe: Probe
  /** Hypotheses this probe ruled out for the first time. */
  eliminated: Hypothesis[]
}

export function timeline(probes: readonly Probe[]): TimelineEntry[] {
  let alive = HYPOTHESES.filter(h => h.test(START))
  return probes.map(probe => {
    const eliminated = alive.filter(h => h.test(probe.triple) !== probe.awesome)
    alive = alive.filter(h => !eliminated.includes(h))
    return { probe, eliminated }
  })
}

export { TRUTH }
