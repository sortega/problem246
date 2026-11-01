import type { Belief } from './belief'
import { isAwesome, TRUTH_ID } from './hypotheses'
import { complexity, POOL } from './pool'
import { makeRng, shuffle } from './rng'
import { key, type Probe, type Triple } from './types'

export const QUIZ_LENGTH = 8
const MIN_AWESOME = 3
const MAX_AWESOME = 5
/** Each extra question catching the same hypothesis is worth this much less. */
const REPEAT_DECAY = 0.35
/** Dead hypotheses still count a little, so careful users get meaningful questions too. */
const DEAD_WEIGHT = 0.004
const ALIVE_FLOOR = 0.02
const COMPLEXITY_COST = 0.01
/** Bonus for telling apart two likely beliefs, so the reveal can name the right one. */
const SPLIT_WEIGHT = 0.3
const SPLIT_MIN_WEIGHT = 0.05
const ANCHOR_SHARE = 0.25

const descending = ([a, b, c]: Triple) => a > b && b > c

/**
 * Picks quiz triples that split the hypotheses the user may hold from the true
 * rule, spending most questions on the likeliest ones (greedy weighted cover).
 */
export function makeQuiz(bs: readonly Belief[], probes: readonly Probe[], seed: number): Triple[] {
  const rng = makeRng(seed)
  const tested = new Set(probes.map(p => key(p.triple)))
  const targets = bs
    .filter(b => b.hypothesis.id !== TRUTH_ID)
    .map(b => ({
      test: b.hypothesis.test,
      weight: b.alive ? b.weight + ALIVE_FLOOR : DEAD_WEIGHT * b.hypothesis.prior,
      caught: 0,
    }))
  const likely = targets.filter(h => h.weight >= SPLIT_MIN_WEIGHT)
  const pairs = likely.flatMap((x, i) => likely.slice(i + 1).map(y => ({ x, y, split: false })))
  // Random tie-breaking so two plays with the same history still differ.
  const jitter = new Map(POOL.map(t => [key(t), rng() * 0.01]))
  let candidates = POOL.filter(t => !tested.has(key(t)))

  // One question the user's likeliest rules all say yes to, so the quiz doesn't
  // look suspiciously empty to them. Falls back to fewer rules, then to none.
  const ranked = targets.filter(h => h.weight > ALIVE_FLOOR).sort((x, y) => y.weight - x.weight)
  const anchors = [ranked.filter(h => h.weight >= ANCHOR_SHARE * ranked[0]!.weight), ranked.slice(0, 1)]
    .filter(hs => hs.length > 0)
    .map(hs => (t: Triple) => hs.every(h => h.test(t)))
  let anchor = anchors.shift()
  const chosen: Triple[] = []
  let awesome = 0
  while (chosen.length < QUIZ_LENGTH) {
    const slotsLeft = QUIZ_LENGTH - chosen.length
    const mustBeAwesome = MIN_AWESOME - awesome >= slotsLeft
    const mustNotBe = awesome >= MAX_AWESOME || chosen.length - awesome + slotsLeft <= QUIZ_LENGTH - MAX_AWESOME
    const needsDescending = slotsLeft === 1 && !chosen.some(descending)

    let best: Triple | undefined
    let bestScore = -Infinity
    for (const t of candidates) {
      const truth = isAwesome(t)
      if ((mustBeAwesome && !truth) || (mustNotBe && truth)) continue
      if (needsDescending && !mustBeAwesome && !descending(t)) continue
      if (anchor && !anchor(t)) continue
      let score = jitter.get(key(t))! - COMPLEXITY_COST * complexity(t)
      for (const h of targets) if (h.test(t) !== truth) score += h.weight * REPEAT_DECAY ** h.caught
      for (const p of pairs) {
        if (!p.split && p.x.test(t) !== p.y.test(t)) score += SPLIT_WEIGHT * Math.min(p.x.weight, p.y.weight)
      }
      if (score > bestScore) [best, bestScore] = [t, score]
    }
    if (!best && anchor) {
      anchor = anchors.shift()
      continue
    }
    if (!best) break
    anchor = undefined
    const truth = isAwesome(best)
    for (const h of targets) if (h.test(best) !== truth) h.caught++
    for (const p of pairs) if (p.x.test(best) !== p.y.test(best)) p.split = true
    chosen.push(best)
    if (truth) awesome++
    candidates = candidates.filter(t => t !== best)
  }
  return shuffle(chosen, rng)
}
