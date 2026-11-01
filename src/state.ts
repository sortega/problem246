import { beliefs } from './engine/belief'
import { bestMatch, countWrong } from './engine/diagnose'
import { makeQuiz } from './engine/quiz'
import type { Probe, Triple } from './engine/types'

export type Confidence = 'low' | 'medium' | 'high'

export interface Attempt {
  /** How many probes the user had made when they announced. */
  probeCount: number
  statement: string
  confidence: Confidence
  quiz: Triple[]
  answers: boolean[]
  wrong: number
  /** Id of the hypothesis that best explains the answers. */
  matchId: string
  mismatches: number
}

export type Phase = 'intro' | 'experiment' | 'commit' | 'quiz' | 'verdict' | 'reveal'

export interface State {
  phase: Phase
  probes: Probe[]
  attempts: Attempt[]
  /** The quiz in progress, if any. */
  pending?: { statement: string; confidence: Confidence; quiz: Triple[] }
}

export const MAX_ATTEMPTS = 2

export const initialState: State = { phase: 'intro', probes: [], attempts: [] }

export type Action =
  | { type: 'start' }
  | { type: 'probe'; probe: Probe }
  | { type: 'announce' }
  | { type: 'back' }
  | { type: 'commit'; statement: string; confidence: Confidence; seed: number }
  | { type: 'answer'; answers: boolean[] }
  | { type: 'retry' }
  | { type: 'reveal' }
  | { type: 'restart' }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { ...state, phase: 'experiment' }
    case 'probe':
      return { ...state, probes: [...state.probes, action.probe] }
    case 'announce':
      return { ...state, phase: 'commit' }
    case 'back':
      return { ...state, phase: 'experiment', pending: undefined }
    case 'commit': {
      const quiz = makeQuiz(beliefs(state.probes), state.probes, action.seed)
      return { ...state, phase: 'quiz', pending: { statement: action.statement, confidence: action.confidence, quiz } }
    }
    case 'answer': {
      if (!state.pending) return state
      const { quiz, statement, confidence } = state.pending
      const match = bestMatch(quiz, action.answers, beliefs(state.probes))
      const attempt: Attempt = {
        probeCount: state.probes.length, statement, confidence, quiz,
        answers: action.answers,
        wrong: countWrong(quiz, action.answers),
        matchId: match.hypothesis.id,
        mismatches: match.mismatches,
      }
      const attempts = [...state.attempts, attempt]
      const done = attempt.wrong === 0 || attempts.length >= MAX_ATTEMPTS
      return { ...state, attempts, pending: undefined, phase: done ? 'reveal' : 'verdict' }
    }
    case 'retry':
      return { ...state, phase: 'experiment' }
    case 'reveal':
      return { ...state, phase: 'reveal' }
    case 'restart':
      return { ...initialState, phase: 'experiment' }
  }
}

const STORAGE_KEY = 'problem246/v2'

export function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState, ...(JSON.parse(raw) as State) }
  } catch {
    // Storage may be unavailable (private mode) or hold an old format.
  }
  return initialState
}

export function saveState(state: State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Not being able to resume after a reload is fine.
  }
}
