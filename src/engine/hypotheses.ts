import type { Triple } from './types'

export interface Hypothesis {
  id: string
  /** Phrased as the user would announce it. */
  label: string
  /** Relative popularity as a first guess, seeded from Wason (1960), Table III. */
  prior: number
  test: (t: Triple) => boolean
}

// Inputs are integers with |x| <= 1e6 (see parse.ts), so all arithmetic below is exact.
const isEven = (x: number) => x % 2 === 0

export const increasing = ([a, b, c]: Triple) => a < b && b < c
const decreasing = ([a, b, c]: Triple) => a > b && b > c
const sameStep = ([a, b, c]: Triple) => b - a === c - b
const allEven = (t: Triple) => t.every(isEven)

export const TRUTH_ID = 'increasing'

export const HYPOTHESES: readonly Hypothesis[] = [
  { id: TRUTH_ID, label: 'Each number is bigger than the one before', prior: 6, test: increasing },

  // Too narrow: these are the "sufficient rules" Wason's subjects announced.
  { id: 'plus-two', label: 'Add 2 each time', prior: 8, test: ([a, b, c]) => b - a === 2 && c - b === 2 },
  { id: 'consecutive-even', label: 'Consecutive even numbers', prior: 3, test: t => allEven(t) && t[1] - t[0] === 2 && t[2] - t[1] === 2 },
  { id: 'multiples', label: 'A number, then twice it, then three times it', prior: 4, test: ([a, b, c]) => a !== 0 && b === 2 * a && c === 3 * a },
  { id: 'arithmetic-up', label: 'Going up by the same amount each time', prior: 3, test: t => increasing(t) && sameStep(t) },
  { id: 'even-arithmetic', label: 'Even numbers going up by the same amount', prior: 1, test: t => allEven(t) && increasing(t) && sameStep(t) },
  { id: 'add-or-multiply', label: 'Going up by adding or multiplying by a constant', prior: 1, test: t => increasing(t) && (sameStep(t) || t[1] * t[1] === t[0] * t[2]) },
  { id: 'a-plus-b', label: 'The first two add up to the third', prior: 1, test: ([a, b, c]) => a + b === c },
  { id: 'sum-12', label: 'The three numbers add up to 12', prior: 1, test: ([a, b, c]) => a + b + c === 12 },
  { id: 'double-then-up', label: 'The second is double the first, then it goes up', prior: 0.5, test: ([a, b, c]) => a > 0 && b === 2 * a && c > b },
  { id: 'even-increasing', label: 'Even numbers in increasing order', prior: 1.5, test: t => allEven(t) && increasing(t) },
  { id: 'even-gaps', label: 'Going up in even-sized steps', prior: 0.5, test: t => increasing(t) && isEven(t[1] - t[0]) && isEven(t[2] - t[1]) },
  { id: 'growing-gaps', label: 'Going up, and the steps never shrink', prior: 0.5, test: ([a, b, c]) => a < b && c - b >= b - a },
  { id: 'positive-increasing', label: 'Positive numbers in increasing order', prior: 1, test: t => t[0] > 0 && increasing(t) },
  { id: 'single-digits', label: 'Single digits in increasing order', prior: 0.5, test: t => t.every(x => x >= 0 && x <= 9) && increasing(t) },

  // Too broad, or simply different: only "not awesome" answers can rule these out.
  { id: 'arithmetic-any', label: 'The middle number is halfway between the other two', prior: 1.5, test: sameStep },
  { id: 'all-even', label: 'All three numbers are even', prior: 1, test: allEven },
  { id: 'non-decreasing', label: 'Each number is at least as big as the one before', prior: 1, test: ([a, b, c]) => a <= b && b <= c },
  { id: 'ordered', label: 'The numbers are in order, up or down', prior: 1, test: t => increasing(t) || decreasing(t) },
  { id: 'last-largest', label: 'The last number is the biggest', prior: 0.7, test: ([a, b, c]) => c > a && c > b },
  { id: 'first-smallest', label: 'The first number is the smallest', prior: 0.5, test: ([a, b, c]) => a < b && a < c },
  { id: 'distinct', label: 'Three different numbers', prior: 0.7, test: ([a, b, c]) => a !== b && b !== c && a !== c },
  { id: 'anything', label: 'Any three numbers at all', prior: 0.3, test: () => true },
]

const byId = new Map(HYPOTHESES.map(h => [h.id, h]))

export function hypothesis(id: string): Hypothesis {
  const h = byId.get(id)
  if (!h) throw new Error(`Unknown hypothesis ${id}`)
  return h
}

export const TRUTH = hypothesis(TRUTH_ID)

export const isAwesome = (t: Triple): boolean => TRUTH.test(t)

/** Wason's nesting chain: each rule entails the next one. */
export const CHAIN = ['consecutive-even', 'plus-two', 'arithmetic-up', TRUTH_ID] as const
