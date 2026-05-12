import { describe, it, expect } from 'vitest'
import { generateBracket } from '../services/bracketService.js'

describe('generateBracket', () => {
  it('2 atletas: 1 final, sin byes', () => {
    const matches = generateBracket(['a1', 'a2'])
    expect(matches).toHaveLength(1)
    expect(matches[0].round).toBe(1)
    expect(matches[0].status).toBe('pending')
    expect(matches[0].athlete1Id).toBeTruthy()
    expect(matches[0].athlete2Id).toBeTruthy()
  })

  it('4 atletas: 3 matches (2 semis + 1 final)', () => {
    const matches = generateBracket(['a1','a2','a3','a4'])
    expect(matches).toHaveLength(3)
    expect(matches.filter(m => m.round === 1)).toHaveLength(2)
    expect(matches.filter(m => m.round === 2)).toHaveLength(1)
    const allPending = matches.every(m => m.status === 'pending')
    expect(allPending).toBe(true)
  })

  it('3 atletas: 1 bye auto-advance, final tiene un slot lleno', () => {
    const matches = generateBracket(['a1','a2','a3'])
    const byeMatches = matches.filter(m => m.status === 'finished')
    expect(byeMatches.length).toBeGreaterThanOrEqual(1)
    const final = matches.find(m => m.round === 2)
    expect(final.athlete1Id !== null || final.athlete2Id !== null).toBe(true)
  })

  it('5 atletas: bracket 8-slot, 7 matches totales', () => {
    const matches = generateBracket(['a1','a2','a3','a4','a5'])
    expect(matches).toHaveLength(7)
  })

  it('cada match tiene la forma correcta', () => {
    const [match] = generateBracket(['a1', 'a2'])
    expect(match).toMatchObject({
      id: expect.any(String),
      round: expect.any(Number),
      position: expect.any(Number),
      status: expect.any(String),
      result: {
        type: null,
        athlete1: { points: 0, advantages: 0, penalties: 0 },
        athlete2: { points: 0, advantages: 0, penalties: 0 }
      }
    })
  })
})
