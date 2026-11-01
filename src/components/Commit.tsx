import { useState } from 'react'
import type { Confidence } from '../state'

interface Props {
  probeCount: number
  onBack: () => void
  onCommit: (statement: string, confidence: Confidence) => void
}

const LEVELS: { value: Confidence; label: string }[] = [
  { value: 'low', label: 'A hunch' },
  { value: 'medium', label: 'Fairly sure' },
  { value: 'high', label: 'Certain' },
]

export default function Commit({ probeCount, onBack, onCommit }: Props) {
  const [statement, setStatement] = useState('')
  const [confidence, setConfidence] = useState<Confidence>('high')
  return (
    <section className="card prose">
      <h2>Write it down</h2>
      <p>
        Before I test you, write the rule down in your own words. It’s optional, but committing to it now means you can’t
        quietly adjust it after seeing my questions. Wason’s subjects had to do the same.
      </p>
      <textarea
        aria-label="Your rule"
        rows={3}
        placeholder="Awesome triples are the ones where…"
        value={statement}
        onChange={e => setStatement(e.target.value)}
      />
      <fieldset className="segmented">
        <legend>How sure are you?</legend>
        {LEVELS.map(l => (
          <label key={l.value} className={confidence === l.value ? 'on' : ''}>
            <input type="radio" name="confidence" value={l.value} checked={confidence === l.value}
              onChange={() => setConfidence(l.value)} />
            {l.label}
          </label>
        ))}
      </fieldset>
      {probeCount < 5 && (
        <p className="muted">
          You’ve tested {probeCount} triple{probeCount === 1 ? '' : 's'}. People who got this right first time in
          Wason’s study tested 8 on average.
        </p>
      )}
      <div className="actions">
        <button className="ghost" onClick={onBack}>Keep experimenting</button>
        <button className="primary" onClick={() => onCommit(statement.trim(), confidence)}>Test me</button>
      </div>
    </section>
  )
}
