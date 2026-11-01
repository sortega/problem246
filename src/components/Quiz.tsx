import { useState } from 'react'
import type { Triple as T } from '../engine/types'
import { Triple } from './Triple'

interface Props {
  quiz: T[]
  statement: string
  onSubmit: (answers: boolean[]) => void
}

export default function Quiz({ quiz, statement, onSubmit }: Props) {
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => quiz.map(() => null))
  const done = answers.every(a => a !== null)
  const set = (i: number, value: boolean) => setAnswers(as => as.map((a, j) => (j === i ? value : a)))

  return (
    <section className="card">
      <h2>Is it awesome?</h2>
      <p className="muted">
        Answer according to your rule{statement && <>: <q>{statement}</q></>}. You won’t see the right answers until the end.
      </p>
      <ol className="quiz">
        {quiz.map((t, i) => (
          <li key={i}>
            <Triple triple={t} />
            <span className="choice" role="radiogroup" aria-label={`Is ${t.join(', ')} awesome?`}>
              <button role="radio" aria-checked={answers[i] === true}
                className={answers[i] === true ? 'yes on' : 'yes'} onClick={() => set(i, true)}>✓ awesome</button>
              <button role="radio" aria-checked={answers[i] === false}
                className={answers[i] === false ? 'no on' : 'no'} onClick={() => set(i, false)}>✗ not</button>
            </span>
          </li>
        ))}
      </ol>
      <div className="actions">
        <span className="muted">{answers.filter(a => a !== null).length} / {quiz.length} answered</span>
        <button className="primary" disabled={!done} onClick={() => onSubmit(answers as boolean[])}>
          Submit my answers
        </button>
      </div>
    </section>
  )
}
