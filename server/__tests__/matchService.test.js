import { describe, it, expect } from 'vitest'
import { applyScore, determineWinnerByPoints } from '../services/matchService.js'

const base = () => ({
  athlete1: { points: 0, advantages: 0, penalties: 0 },
  athlete2: { points: 0, advantages: 0, penalties: 0 }
})

describe('applyScore', () => {
  it('suma puntos a athlete1', () => {
    const r = applyScore(base(), 'athlete1', 'points', 2)
    expect(r.athlete1.points).toBe(2)
    expect(r.athlete2.points).toBe(0)
  })

  it('suma ventaja a athlete2', () => {
    const r = applyScore(base(), 'athlete2', 'advantages', 1)
    expect(r.athlete2.advantages).toBe(1)
  })

  it('resta puntos sin bajar de 0', () => {
    const r = applyScore(base(), 'athlete1', 'points', -4)
    expect(r.athlete1.points).toBe(0)
  })

  it('suma y luego resta correctamente', () => {
    let r = applyScore(base(), 'athlete1', 'points', 4)
    r = applyScore(r, 'athlete1', 'points', -2)
    expect(r.athlete1.points).toBe(2)
  })
})

describe('determineWinnerByPoints', () => {
  it('más puntos gana', () => {
    const r = { athlete1: { points: 4, advantages: 0, penalties: 0 }, athlete2: { points: 2, advantages: 0, penalties: 0 } }
    expect(determineWinnerByPoints(r, 'a1', 'a2')).toBe('a1')
  })

  it('empate en puntos: más ventajas gana', () => {
    const r = { athlete1: { points: 2, advantages: 2, penalties: 0 }, athlete2: { points: 2, advantages: 1, penalties: 0 } }
    expect(determineWinnerByPoints(r, 'a1', 'a2')).toBe('a1')
  })

  it('empate en puntos y ventajas: menos penalizaciones gana', () => {
    const r = { athlete1: { points: 2, advantages: 1, penalties: 1 }, athlete2: { points: 2, advantages: 1, penalties: 0 } }
    expect(determineWinnerByPoints(r, 'a1', 'a2')).toBe('a2')
  })

  it('empate total: retorna null (árbitro decide)', () => {
    const r = { athlete1: { points: 2, advantages: 1, penalties: 0 }, athlete2: { points: 2, advantages: 1, penalties: 0 } }
    expect(determineWinnerByPoints(r, 'a1', 'a2')).toBeNull()
  })
})
