import { useRef, useState, type FormEvent } from 'react'
import { isAwesome } from '../engine/hypotheses'
import { MAX_ABS, parseNumber } from '../engine/parse'
import { key, START, type Probe, type Triple as T } from '../engine/types'
import { Triple, Verdict } from './Triple'

interface Props {
  probes: Probe[]
  retrying: boolean
  onProbe: (probe: Probe) => void
  onAnnounce: () => void
}

export default function RecordSheet({ probes, retrying, onProbe, onAnnounce }: Props) {
  const [fields, setFields] = useState(['', '', ''])
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const firstInput = useRef<HTMLInputElement>(null)

  const rows: Probe[] = [{ triple: START, awesome: true, reason: 'Given to you' }, ...probes]
  const noes = probes.filter(p => !p.awesome).length

  function submit(e: FormEvent) {
    e.preventDefault()
    const numbers = fields.map(parseNumber)
    if (numbers.some(n => n === null)) {
      setError(`Please enter three whole numbers between −${MAX_ABS.toLocaleString()} and ${MAX_ABS.toLocaleString()}.`)
      return
    }
    const triple = numbers as unknown as T
    const previous = rows.find(p => key(p.triple) === key(triple))
    if (previous) {
      setError(`You already tested ${triple.join(', ')}: it was ${previous.awesome ? 'awesome' : 'not awesome'}.`)
      return
    }
    onProbe({ triple, awesome: isAwesome(triple), reason: reason.trim() || undefined })
    setFields(['', '', ''])
    setReason('')
    setError(undefined)
    firstInput.current?.focus()
  }

  return (
    <section className="card">
      {retrying && (
        <p className="notice">
          Your rule wasn’t quite right. Keep experimenting: try triples that would prove your rule <em>wrong</em>.
        </p>
      )}
      <h2 className="sheet-title">Record sheet</h2>
      <div className="sheet" role="table" aria-label="Triples tested so far">
        <div className="sheet-row sheet-head" role="row">
          <span role="columnheader">Numbers</span>
          <span role="columnheader">Reason for choice</span>
          <span role="columnheader">Result</span>
        </div>
        {rows.map((p, i) => (
          <div className="sheet-row locked" role="row" key={i}>
            <span role="cell"><Triple triple={p.triple} /></span>
            <span role="cell" className="reason">{p.reason ?? '—'}</span>
            <span role="cell"><Verdict awesome={p.awesome} /></span>
          </div>
        ))}
        <form className="sheet-row entry" onSubmit={submit}>
          <span className="inputs">
            {fields.map((value, i) => (
              <input
                key={i}
                ref={i === 0 ? firstInput : undefined}
                aria-label={`Number ${i + 1}`}
                inputMode="numeric"
                autoComplete="off"
                autoFocus={i === 0}
                placeholder={String(rows.at(-1)!.triple[i])}
                value={value}
                onChange={e => setFields(fs => fs.map((f, j) => (j === i ? e.target.value : f)))}
              />
            ))}
          </span>
          <input
            className="reason-input"
            aria-label="Reason for choice (optional)"
            placeholder="Why this one? (optional)"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          <button type="submit" className="primary">Test</button>
        </form>
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      <div className="sheet-footer">
        <p className="tally">
          {probes.length === 0
            ? 'Nothing tested yet.'
            : `${probes.length} tested · ${noes} came back not awesome`}
        </p>
        <button className="secondary" onClick={onAnnounce} disabled={probes.length === 0}>
          I know the rule
        </button>
      </div>
    </section>
  )
}
