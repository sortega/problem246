import { useEffect, useReducer } from 'react'
import Commit from './components/Commit'
import Intro from './components/Intro'
import Quiz from './components/Quiz'
import RecordSheet from './components/RecordSheet'
import Reveal from './components/Reveal'
import Verdict from './components/Verdict'
import { loadState, reducer, saveState } from './state'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => { saveState(state) }, [state])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [state.phase])

  const last = state.attempts.at(-1)
  return (
    <main className="page">
      <header className="masthead">
        <p className="kicker">A replication of Wason (1960)</p>
        <h1 className="title">
          <span>2</span><span>4</span><span>6</span>
        </h1>
      </header>

      {state.phase === 'intro' && <Intro onStart={() => dispatch({ type: 'start' })} />}
      {state.phase === 'experiment' && (
        <RecordSheet
          probes={state.probes}
          retrying={state.attempts.length > 0}
          onProbe={probe => dispatch({ type: 'probe', probe })}
          onAnnounce={() => dispatch({ type: 'announce' })}
        />
      )}
      {state.phase === 'commit' && (
        <Commit
          probeCount={state.probes.length}
          onBack={() => dispatch({ type: 'back' })}
          onCommit={(statement, confidence) =>
            dispatch({ type: 'commit', statement, confidence, seed: Date.now() })}
        />
      )}
      {state.phase === 'quiz' && state.pending && (
        <Quiz
          quiz={state.pending.quiz}
          statement={state.pending.statement}
          onSubmit={answers => dispatch({ type: 'answer', answers })}
        />
      )}
      {state.phase === 'verdict' && last && (
        <Verdict
          attempt={last}
          onRetry={() => dispatch({ type: 'retry' })}
          onReveal={() => dispatch({ type: 'reveal' })}
        />
      )}
      {state.phase === 'reveal' && (
        <Reveal state={state} onRestart={() => dispatch({ type: 'restart' })} />
      )}

      <footer className="footer">
        Based on MBlume’s C++ program from <a href="https://www.lesswrong.com/w/positive-bias">LessWrong</a>.
        {' '}<a href="https://github.com/sortega/problem246">Source on GitHub</a>.
      </footer>
    </main>
  )
}
