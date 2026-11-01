import type { Attempt } from '../state'

interface Props {
  attempt: Attempt
  onRetry: () => void
  onReveal: () => void
}

export default function Verdict({ attempt, onRetry, onReveal }: Props) {
  const { wrong, quiz } = attempt
  return (
    <section className="card prose">
      <h2>Not quite</h2>
      <p className="big-number">
        {wrong} <span>of {quiz.length} answers were wrong</span>
      </p>
      <p>
        That’s all Wason told his subjects too: that their rule was wrong, not where. Of the 22 who announced a wrong rule, 10
        got it right at their very next attempt.
      </p>
      <p className="hint">
        <strong>A hint from later research.</strong> People do much better when they look for two rules at once: what
        makes a triple awesome, and what makes one <em>not</em> awesome. Try triples you expect to fail.
      </p>
      <div className="actions">
        <button className="ghost" onClick={onReveal}>Just tell me the rule</button>
        <button className="primary" onClick={onRetry}>Back to the record sheet</button>
      </div>
    </section>
  )
}
