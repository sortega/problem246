import { CHAIN, hypothesis, TRUTH_ID } from '../engine/hypotheses'
import { key, START, type Probe } from '../engine/types'
import { ellipseDistance, slotAllocator, type Ellipse } from './layout'
import { Legend, ProbeMark } from './Marks'

const W = 640
const H = 380
const LAYERS = [
  { id: 'all', label: 'All triples', scale: 1 },
  ...CHAIN.slice().reverse().map((id, i) => ({
    id,
    label: id === TRUTH_ID ? 'Increasing: the real rule' : hypothesis(id).label,
    scale: [0.8, 0.6, 0.41, 0.23][i]!,
  })),
]
const ellipse = (scale: number): Ellipse => ({ cx: W / 2, cy: H / 2 + 6, rx: (W / 2 - 8) * scale, ry: (H / 2 - 10) * scale })

/** Index of the innermost layer containing the triple. */
function depth(probe: Probe): number {
  let d = 0
  LAYERS.forEach((l, i) => { if (i > 0 && hypothesis(l.id).test(probe.triple)) d = i })
  return d
}

interface Props {
  probes: Probe[]
  /** Hypothesis to highlight as "your rule". */
  highlight?: string
}

/**
 * Wason's observation that the popular wrong rules are nested inside each other,
 * and all inside the real one, with the user's own probes plotted on top.
 */
export default function NestedSets({ probes, highlight }: Props) {
  const ellipses = LAYERS.map(l => ellipse(l.scale))
  const slot = slotAllocator(W, H, 22, p => {
    // Keep clear of ring edges and of the label at the top of each ring.
    const ds = ellipses.map(e => ellipseDistance(e, p.x, p.y))
    let ring = -1
    ds.forEach((d, i) => { if (d < 1) ring = i })
    if (ring < 0) return null
    const e = ellipses[ring]!
    const inner = ellipses[ring + 1]
    if (ds[ring]! > 1 - 14 / e.ry) return null
    if (inner && ds[ring + 1]! < 1 + 14 / inner.ry) return null
    if (p.y < e.cy - e.ry + 34 && Math.abs(p.x - e.cx) < 150) return null
    return String(ring)
  })
  const all = [{ triple: START, awesome: true }, ...probes]

  return (
    <figure className="figure">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Nested sets of rules, with your tested triples">
        {LAYERS.map((l, i) => {
          const e = ellipses[i]!
          const cls = ['layer', `layer-${i}`, l.id === TRUTH_ID ? 'truth' : '', l.id === highlight ? 'yours' : ''].join(' ')
          return (
            <g key={l.id} className={cls}>
              <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />
              <text x={e.cx} y={e.cy - e.ry + 20} textAnchor="middle">
                {l.label}{l.id === highlight ? '  ← your rule' : ''}
              </text>
            </g>
          )
        })}
        {all.map(p => {
          const at = slot(String(depth(p)), key(p.triple))
          return at && <ProbeMark key={key(p.triple)} at={at} triple={p.triple} awesome={p.awesome} />
        })}
      </svg>
      <figcaption>
        Wason noticed that the wrong rules his subjects announced fit inside each other: consecutive even numbers are
        a special case of adding 2, which is a special case of going up by a fixed step, which is a special case of
        the real rule. Your triples are plotted in the innermost set they belong to.
      </figcaption>
      <Legend />
    </figure>
  )
}
