import { REFERENCES, TRUE_RULE, WASON_FIRST, WASON_PROBES } from '../content/text'
import { counterexample, timeline } from '../engine/diagnose'
import { hypothesis, isAwesome, TRUTH_ID } from '../engine/hypotheses'
import BarChart from '../figures/BarChart'
import NestedSets from '../figures/NestedSets'
import VennPositiveTest from '../figures/VennPositiveTest'
import type { Attempt, State } from '../state'
import { Triple, Verdict } from './Triple'

interface Props {
  state: State
  onRestart: () => void
}

export default function Reveal({ state, onRestart }: Props) {
  const { probes, attempts } = state
  const first = attempts[0]
  const last = attempts.at(-1)
  const solved = last?.wrong === 0
  const firstTime = first?.wrong === 0
  const wrongRule = attempts.find(a => a.wrong > 0)
  const yours = wrongRule && hypothesis(wrongRule.matchId)
  const showYours = yours && yours.id !== TRUTH_ID
  const example = showYours ? counterexample(yours) : undefined
  const probesBeforeFirst = first?.probeCount ?? probes.length
  const noes = probes.filter(p => !p.awesome).length

  return (
    <>
      <section className="card prose">
        <p className="kicker">{solved ? (firstTime ? 'First time. Well done.' : 'Got there in the end.') : 'The rule was…'}</p>
        <h2 className="rule">{TRUE_RULE}</h2>
        <p>
          {firstTime
            ? <>Only 6 of Wason’s 29 subjects managed that at their first announcement. You tested {probesBeforeFirst} triple{probesBeforeFirst === 1 ? '' : 's'} first, {noes > 0 ? <>including {noes} that came back not awesome</> : <>none of which came back not awesome. Lucky, or very sure</>}.</>
            : <>That’s the whole rule. Any increase will do: <Triple triple={[1, 2, 1000]} /> and <Triple triple={[-7, 0, 3]} /> are both awesome.</>}
        </p>
      </section>

      {attempts.map((a, i) => <AttemptCard key={i} attempt={a} index={i} total={attempts.length} />)}

      {showYours && (
        <section className="card prose">
          <h2>Why it fooled you</h2>
          {example && (
            <p>
              {example.awesome
                ? <>One triple would have settled it: <Triple triple={example.triple} />. It doesn’t fit «{yours.label}», but it is awesome.</>
                : <>One triple would have settled it: <Triple triple={example.triple} />. It fits «{yours.label}», but it is not awesome.</>}
            </p>
          )}
          <VennPositiveTest hypothesis={yours} probes={probes} counterexample={example?.triple} />
          <p>
            This isn’t a failure of intelligence. Klayman and Ha (1987) showed that testing cases you expect to fit your
            idea is usually a good strategy. It fails in one special situation: when your idea is a narrower version of
            the truth. Then the world keeps saying “yes”, and every yes feels like evidence. Wason put it this way: a
            rule that’s too specific “can only be eliminated by a positive instance which is incompatible with it”.
          </p>
        </section>
      )}

      <section className="card prose">
        <h2>Where you looked</h2>
        <NestedSets probes={probes} highlight={showYours ? yours.id : undefined} />
        <Timeline state={state} />
      </section>

      <section className="card prose">
        <h2>You and Wason’s subjects</h2>
        <BarChart
          title="Right at the first announcement"
          max={100}
          bars={[
            { label: 'Wason 1960', value: (100 * WASON_FIRST.correct) / WASON_FIRST.n, display: `${WASON_FIRST.correct} of ${WASON_FIRST.n} (21%)` },
            { label: 'Two-rule version', value: 60, display: 'about 60%' },
            ...(first ? [{ label: 'You', value: firstTime ? 100 : 0, display: firstTime ? 'yes' : 'no', you: true }] : []),
          ]}
        />
        <BarChart
          title="Triples tested before the first announcement (Wason 1960)"
          max={Math.max(10, probesBeforeFirst)}
          bars={[
            { label: 'Right first time', value: WASON_PROBES.correct, display: WASON_PROBES.correct.toFixed(1) },
            { label: 'Wrong first time', value: WASON_PROBES.incorrect, display: WASON_PROBES.incorrect.toFixed(1) },
            { label: 'You', value: probesBeforeFirst, display: String(probesBeforeFirst), you: true },
          ]}
        />
        <p>
          In Wason’s study, the subjects who got it right didn’t just test more triples. They tested more triples
          that came back <em>not</em> awesome: about a fifth of their tests, against one in twenty-five for the rest.
          The “two-rule version” is a later variant by Tweney and colleagues. Subjects were asked to find two
          complementary rules, “DAX” (the real rule) and “MED” (everything else). Hunting for what is <em>not</em>
          awesome roughly tripled the success rate.
        </p>
      </section>

      <section className="card prose">
        <h2>Further reading</h2>
        <ul className="references">
          {REFERENCES.map(r => (
            <li key={r.url}>
              <a href={r.url}>{r.title}</a>
              <span className="cite">{r.cite}</span>
              <span>{r.note}</span>
            </li>
          ))}
        </ul>
        <p className="center">
          <button className="secondary" onClick={onRestart}>Play again</button>
        </p>
      </section>
    </>
  )
}

function AttemptCard({ attempt, index, total }: { attempt: Attempt; index: number; total: number }) {
  const match = hypothesis(attempt.matchId)
  const title = total > 1 ? `Your ${index === 0 ? 'first' : 'second'} announcement` : 'Your announcement'
  return (
    <section className="card prose">
      <h2>{title}</h2>
      {attempt.statement && <blockquote><p>{attempt.statement}</p></blockquote>}
      {attempt.wrong > 0 && match.id !== TRUTH_ID && (
        <p>
          {attempt.mismatches === 0
            ? <>Your answers fit this rule exactly: <strong>«{match.label}»</strong>.</>
            : <>Your answers came closest to <strong>«{match.label}»</strong> ({attempt.mismatches} answer{attempt.mismatches === 1 ? '' : 's'} off).</>}
          {' '}That’s {attempt.statement ? 'how I read what you wrote, judging' : 'what you seemed to believe, judging'} by how you answered.
        </p>
      )}
      <ol className="quiz review">
        {attempt.quiz.map((t, i) => {
          const truth = isAwesome(t)
          const right = attempt.answers[i] === truth
          return (
            <li key={i} className={right ? 'right' : 'wrong'}>
              <Triple triple={t} />
              <span className="muted">you said {attempt.answers[i] ? 'awesome' : 'not'}</span>
              <Verdict awesome={truth} />
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Timeline({ state }: { state: State }) {
  const entries = timeline(state.probes)
  if (entries.length === 0) return null
  return (
    <details className="timeline">
      <summary>Which rules each of your tests ruled out</summary>
      <ol>
        {entries.map((e, i) => (
          <li key={i}>
            <Triple triple={e.probe.triple} /> <Verdict awesome={e.probe.awesome} />
            <span className="muted">
              {e.eliminated.length === 0
                ? ' ruled out nothing new'
                : ` ruled out: ${e.eliminated.map(h => h.label.toLowerCase()).join('; ')}`}
            </span>
          </li>
        ))}
      </ol>
    </details>
  )
}
