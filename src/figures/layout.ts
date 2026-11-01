/** Deterministic hash so a triple always lands on the same spot in a figure. */
export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export interface Ellipse {
  cx: number
  cy: number
  rx: number
  ry: number
}

/** >1 outside, <1 inside. */
export const ellipseDistance = (e: Ellipse, x: number, y: number) =>
  Math.hypot((x - e.cx) / e.rx, (y - e.cy) / e.ry)

export interface Point {
  x: number
  y: number
}

/**
 * Hands out free grid points from each region, so dots never overlap.
 * `region` maps a point to a region name (or null where nothing may be drawn).
 */
export function slotAllocator(width: number, height: number, step: number, region: (p: Point) => string | null) {
  const slots = new Map<string, Point[]>()
  for (let y = step; y < height - step / 2; y += step) {
    for (let x = step; x < width - step / 2; x += step) {
      const r = region({ x, y })
      if (r) slots.set(r, [...(slots.get(r) ?? []), { x, y }])
    }
  }
  return (name: string, seed: string): Point | undefined => {
    const free = slots.get(name)
    if (!free?.length) return undefined
    const [p] = free.splice(hash(seed) % free.length, 1)
    return p
  }
}
