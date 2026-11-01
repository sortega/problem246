import { describe, expect, it } from 'vitest'
import { beliefs } from './belief'
import { bestMatch, counterexample, countWrong, timeline } from './diagnose'
import { HYPOTHESES, hypothesis, isAwesome, TRUTH_ID } from './hypotheses'
import { parseNumber } from './parse'
import { makeQuiz, QUIZ_LENGTH } from './quiz'
import { key, START, type Probe, type Triple } from './types'

const probe = (...triple: Triple): Probe => ({ triple, awesome: isAwesome(triple) })

const PERSONAS: Record<string, { probes: Probe[]; holds: string }> = {
  plusTwo: { probes: [probe(8, 10, 12), probe(20, 22, 24), probe(1, 3, 5)], holds: 'plus-two' },
  consecutiveEven: { probes: [probe(8, 10, 12), probe(20, 22, 24), probe(100, 102, 104)], holds: 'consecutive-even' },
  multiples: { probes: [probe(3, 6, 9), probe(5, 10, 15), probe(10, 20, 30)], holds: 'multiples' },
  arithmetic: { probes: [probe(1, 2, 3), probe(5, 10, 15), probe(10, 20, 30), probe(3, 7, 11)], holds: 'arithmetic-up' },
}

describe('hypotheses', () => {
  it('all accept 2-4-6', () => {
    for (const h of HYPOTHESES) expect(h.test(START), h.id).toBe(true)
  })
  it('have unique ids', () => {
    expect(new Set(HYPOTHESES.map(h => h.id)).size).toBe(HYPOTHESES.length)
  })
})

describe('beliefs', () => {
  it('never eliminates the true rule', () => {
    const probes = [probe(6, 4, 2), probe(1, 2, 3), probe(5, 5, 5), probe(-3, 0, 1000)]
    expect(beliefs(probes).find(b => b.hypothesis.id === TRUTH_ID)?.alive).toBe(true)
  })
  it.each(Object.entries(PERSONAS))('ranks %s’s rule near the top', (_, { probes, holds }) => {
    const top = beliefs(probes).slice(0, 3).map(b => b.hypothesis.id)
    expect(top).toContain(holds)
  })
})

describe('quiz', () => {
  it.each(Object.entries(PERSONAS))('catches %s at least twice', (_, { probes, holds }) => {
    const quiz = makeQuiz(beliefs(probes), probes, 1)
    const h = hypothesis(holds)
    expect(quiz.filter(t => h.test(t) !== isAwesome(t)).length).toBeGreaterThanOrEqual(2)
  })
  it.each([1, 2, 3, 4, 5])('is well balanced and skips tested triples (seed %i)', seed => {
    for (const { probes } of Object.values(PERSONAS)) {
      const quiz = makeQuiz(beliefs(probes), probes, seed)
      expect(quiz).toHaveLength(QUIZ_LENGTH)
      const awesome = quiz.filter(isAwesome).length
      expect(awesome).toBeGreaterThanOrEqual(3)
      expect(awesome).toBeLessThanOrEqual(5)
      const tested = new Set([START, ...probes.map(p => p.triple)].map(key))
      expect(quiz.some(t => tested.has(key(t)))).toBe(false)
      expect(new Set(quiz.map(key)).size).toBe(QUIZ_LENGTH)
    }
  })
  it.each(Object.entries(PERSONAS))('asks %s at least one triple their own rule accepts', (_, { probes, holds }) => {
    const quiz = makeQuiz(beliefs(probes), probes, 2)
    expect(quiz.some(hypothesis(holds).test)).toBe(true)
  })
  it.each(HYPOTHESES.map(h => h.id))('always fills the quiz, even for a %s believer', id => {
    const probes = [probe(1, 5, 6), probe(3, 4, 5), probe(2, 3, 7)].filter(p => hypothesis(id).test(p.triple))
    expect(makeQuiz(beliefs(probes), probes, 9)).toHaveLength(QUIZ_LENGTH)
  })
  it('still asks discriminating questions of a careful falsifier', () => {
    const probes = [probe(1, 2, 3), probe(6, 4, 2), probe(1, 50, 99), probe(5, 5, 5), probe(-10, 0, 3)]
    const quiz = makeQuiz(beliefs(probes), probes, 7)
    expect(quiz).toHaveLength(QUIZ_LENGTH)
    expect(quiz.some(([a, b, c]) => a > b && b > c)).toBe(true)
  })
})

describe('diagnosis', () => {
  it.each(Object.entries(PERSONAS))('recovers %s from their ideal answers', (_, { probes, holds }) => {
    const bs = beliefs(probes)
    const quiz = makeQuiz(bs, probes, 3)
    const h = hypothesis(holds)
    const answers = quiz.map(h.test)
    expect(countWrong(quiz, answers)).toBeGreaterThan(0)
    expect(bestMatch(quiz, answers, bs)).toEqual({ hypothesis: h, mismatches: 0 })
  })
  it('recognises a perfect score as the true rule', () => {
    const { probes } = PERSONAS.plusTwo!
    const bs = beliefs(probes)
    const quiz = makeQuiz(bs, probes, 3)
    const answers = quiz.map(isAwesome)
    expect(countWrong(quiz, answers)).toBe(0)
    expect(bestMatch(quiz, answers, bs).hypothesis.id).toBe(TRUTH_ID)
  })
  it('finds an awesome counterexample to a narrow rule', () => {
    const c = counterexample(hypothesis('plus-two'))!
    expect(c.awesome).toBe(true)
    expect(hypothesis('plus-two').test(c.triple)).toBe(false)
  })
  it('finds a non-awesome counterexample to a broad rule', () => {
    const c = counterexample(hypothesis('ordered'))!
    expect(c.awesome).toBe(false)
  })
  it('records which probe eliminated what', () => {
    const entries = timeline([probe(8, 10, 12), probe(1, 2, 3)])
    expect(entries[0]!.eliminated.map(h => h.id)).toContain('multiples')
    expect(entries[1]!.eliminated.map(h => h.id)).toContain('plus-two')
  })
})

describe('parseNumber', () => {
  it.each([['7', 7], [' -12 ', -12], ['+3', 3], ['1000000', 1000000]])('accepts %j', (s, n) => {
    expect(parseNumber(s)).toBe(n)
  })
  it.each(['', ' ', '1.5', '1e3', 'Infinity', 'NaN', '0x10', '1000001', '--1', '1 2'])('rejects %j', s => {
    expect(parseNumber(s)).toBeNull()
  })
})
