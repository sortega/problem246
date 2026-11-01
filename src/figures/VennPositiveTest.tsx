import type { Hypothesis } from '../engine/hypotheses'
import { isAwesome } from '../engine/hypotheses'
import { POOL } from '../engine/pool'
import { key, START, type Probe, type Triple } from '../engine/types'
import { ellipseDistance, slotAllocator, type Ellipse } from './layout'
import { Legend, ProbeMark, StarMark } from './Marks'

const W = 640
const H = 360

export type Relation = 'narrower' | 'broader' | 'overlapping'

export function relation(h: Hypothesis): Relation {
  if (!POOL.some(t => h.test(t) && !isAwesome(t))) return 'narrower'
  if (!POOL.some(t => !h.test(t) && isAwesome(t))) return 'broader'
  return 'overlapping'
}

const GEOMETRY: Record<Relation, { truth: Ellipse; yours: Ellipse }> = {
  narrower: { truth: { cx: 320, cy: 185, rx: 290, ry: 160 }, yours: { cx: 230, cy: 200, rx: 130, ry: 85 } },
  broader: { truth: { cx: 230, cy: 200, rx: 130, ry: 85 }, yours: { cx: 320, cy: 185, rx: 290, ry: 160 } },
  overlapping: { truth: { cx: 240, cy: 185, rx: 200, ry: 150 }, yours: { cx: 420, cy: 185, rx: 190, ry: 140 } },
}

const regionOf = (t: Triple, h: Hypothesis) => `${isAwesome(t) ? 'T' : ''}${h.test(t) ? 'H' : ''}`

interface Props {
  hypothesis: Hypothesis
  probes: Probe[]
  counterexample?: Triple
}

/**
 * Klayman & Ha's point: when your rule sits inside the real one, every triple you
 * expect to be awesome is awesome, so positive tests can never prove you wrong.
 */
export default function VennPositiveTest({ hypothesis, probes, counterexample }: Props) {
  const rel = relation(hypothesis)
  const g = GEOMETRY[rel]
  const slot = slotAllocator(W, H, 22, p => {
    const dt = ellipseDistance(g.truth, p.x, p.y)
    const dh = ellipseDistance(g.yours, p.x, p.y)
    const near = (d: number, e: Ellipse) => Math.abs(d - 1) < 14 / Math.min(e.rx, e.ry)
    if (near(dt, g.truth) || near(dh, g.yours) || p.y < 50) return null
    return `${dt < 1 ? 'T' : ''}${dh < 1 ? 'H' : ''}`
  })
  const all = [{ triple: START, awesome: true }, ...probes]
  const label = (e: Ellipse, dx = 0) => ({ x: e.cx + dx, y: e.cy - e.ry + 24 })
  const tl = label(g.truth, rel === 'overlapping' ? -40 : 0)
  const hl = label(g.yours, rel === 'overlapping' ? 40 : 0)

  return (
    <figure className="figure">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Your rule is ${rel} than the real rule`}>
        <rect className="universe" x={4} y={4} width={W - 8} height={H - 8} rx={14} />
        <text className="universe-label" x={18} y={28}>All triples</text>
        <ellipse className="set truth" {...g.truth} />
        <ellipse className="set yours" {...g.yours} />
        <text className="set-label truth" x={tl.x} y={tl.y} textAnchor="middle">The real rule</text>
        <text className="set-label yours" x={hl.x} y={hl.y} textAnchor="middle">Your rule</text>
        {all.map(p => {
          const at = slot(regionOf(p.triple, hypothesis), key(p.triple))
          return at && <ProbeMark key={key(p.triple)} at={at} triple={p.triple} awesome={p.awesome} />
        })}
        {counterexample && (() => {
          const at = slot(regionOf(counterexample, hypothesis), 'star')
          return at && <StarMark at={at} label={`Try ${counterexample.join(', ')}`} />
        })()}
      </svg>
      <figcaption>
        {rel === 'narrower' && <>
          Your rule sits entirely inside the real one. Any triple you expected to be awesome <em>was</em> awesome, so
          testing triples that fit your rule could only ever confirm it. The only way out was to test something in the
          ring around it, which your rule says isn’t awesome.
        </>}
        {rel === 'broader' && <>
          Your rule is broader than the real one. Some triples fit your rule but are not awesome; to find them you
          needed to test triples you expected to pass, outside the small set of the real rule.
        </>}
        {rel === 'overlapping' && <>
          Your rule and the real one overlap, but each covers triples the other doesn’t. Both kinds of test were
          needed: triples that fit your rule and triples that don’t.
        </>}
      </figcaption>
      <Legend star={!!counterexample} />
    </figure>
  )
}
