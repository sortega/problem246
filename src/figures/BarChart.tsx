interface Bar {
  label: string
  value: number
  display: string
  you?: boolean
}

interface Props {
  title: string
  bars: Bar[]
  max: number
}

const W = 560
const ROW = 34
const LABEL_W = 210

/** A small horizontal bar chart with direct labels; the user's own bar is highlighted. */
export default function BarChart({ title, bars, max }: Props) {
  const plotW = W - LABEL_W - 60
  const h = bars.length * ROW + 8
  return (
    <figure className="figure chart">
      <figcaption className="chart-title">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={title}>
        {bars.map((b, i) => {
          const y = i * ROW + 6
          const w = Math.max(3, (b.value / max) * plotW)
          return (
            <g key={b.label} className={b.you ? 'bar you' : 'bar'}>
              <title>{`${b.label}: ${b.display}`}</title>
              <text className="bar-label" x={LABEL_W - 10} y={y + 15} textAnchor="end">{b.label}</text>
              <rect x={LABEL_W} y={y + 4} width={w} height={16} rx={4} />
              <text className="bar-value" x={LABEL_W + w + 8} y={y + 16}>{b.display}</text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
