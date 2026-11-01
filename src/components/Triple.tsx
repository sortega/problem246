import type { Triple as T } from '../engine/types'

export function Triple({ triple }: { triple: T }) {
  return (
    <span className="triple" aria-label={triple.join(', ')}>
      {triple.map((n, i) => <span key={i} className="num">{n}</span>)}
    </span>
  )
}

export function Verdict({ awesome }: { awesome: boolean }) {
  return awesome
    ? <span className="stamp yes">✓ awesome</span>
    : <span className="stamp no">✗ not awesome</span>
}
