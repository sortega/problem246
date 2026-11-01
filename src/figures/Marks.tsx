import type { Triple } from '../engine/types'
import type { Point } from './layout'

/** A tested triple: filled dot if awesome, hollow cross if not. */
export function ProbeMark({ at, triple, awesome }: { at: Point; triple: Triple; awesome: boolean }) {
  return (
    <g className={awesome ? 'mark yes' : 'mark no'} transform={`translate(${at.x} ${at.y})`}>
      <title>{`${triple.join(', ')}: ${awesome ? 'awesome' : 'not awesome'}`}</title>
      <circle r={12} className="hit" />
      {awesome
        ? <circle r={6} />
        : <path d="M-5 -5 L5 5 M5 -5 L-5 5" />}
    </g>
  )
}

export function StarMark({ at, label }: { at: Point; label: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 4 : 10
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return (
    <g className="mark star" transform={`translate(${at.x} ${at.y})`}>
      <title>{label}</title>
      <polygon points={pts} />
    </g>
  )
}

export function Legend({ star }: { star?: boolean }) {
  return (
    <p className="figure-legend">
      <span><svg width="14" height="14" viewBox="-7 -7 14 14" className="mark yes"><circle r={5} /></svg> awesome</span>
      <span><svg width="14" height="14" viewBox="-7 -7 14 14" className="mark no"><path d="M-4 -4 L4 4 M4 -4 L-4 4" /></svg> not awesome</span>
      {star && <span><svg width="14" height="14" viewBox="-7 -7 14 14" className="mark star"><circle r={5} /></svg> a triple worth testing</span>}
    </p>
  )
}
