const NUMBER = /^[-+]?\d+$/
export const MAX_ABS = 1_000_000

/** Parses a user-typed integer. Rejects blanks, decimals, exponents and huge values. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim()
  if (!NUMBER.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) && Math.abs(n) <= MAX_ABS ? n : null
}
