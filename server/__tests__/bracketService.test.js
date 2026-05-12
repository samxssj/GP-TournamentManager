import { describe, it, expect } from 'vitest'
import { generateBracket, propagateWinner, calculatePodium } from '../services/bracketService.js'

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

  it('3 atletas: la final NO se marca como finished prematuramente durante el setup', () => {
    const matches = generateBracket(['a1', 'a2', 'a3'])
    const final = matches.find(m => m.round === 2)
    // La final debe estar pendiente — el bye llena un slot pero no la resuelve
    expect(final.status).toBe('pending')
    expect(final.winnerId).toBeNull()
    // Solo el bye de R1 debe estar finished al inicio
    const finishedR1 = matches.filter(m => m.round === 1 && m.status === 'finished')
    expect(finishedR1.length).toBeGreaterThanOrEqual(1)
  })
})

describe('propagateWinner', () => {
  it('no cascadea cuando el feeder contrario sigue pendiente', () => {
    // Simula bracket de 3 atletas a mano: R1pos0 (pendiente), R1pos1 (bye→finished), R2pos0 (pendiente)
    const r1Real = { id: 'r1p0', round: 1, position: 0, athlete1Id: 'a1', athlete2Id: 'a2', winnerId: null, status: 'pending', result: { type: null }, finishedAt: null }
    const r1Bye  = { id: 'r1p1', round: 1, position: 1, athlete1Id: 'a3', athlete2Id: null,  winnerId: 'a3', status: 'finished', result: { type: 'wo' }, finishedAt: '2026-01-01T00:00:00.000Z' }
    const r2Final = { id: 'r2p0', round: 2, position: 0, athlete1Id: null, athlete2Id: null, winnerId: null, status: 'pending', result: { type: null }, finishedAt: null }
    const matches = [r1Real, r1Bye, r2Final]

    propagateWinner(matches, r1Bye)

    // La final recibe a3 en un slot pero sigue pendiente porque R1pos0 aún no terminó
    expect(r2Final.winnerId).toBeNull()
    expect(r2Final.status).toBe('pending')
  })

  it('cascadea correctamente cuando el feeder contrario ya está resuelto', () => {
    // Simula bracket de 5 atletas: R1pos2 real (finished), R1pos3 ghost (finished), R2pos1 (pendiente)
    const r1Ghost  = { id: 'r1p3', round: 1, position: 3, athlete1Id: null, athlete2Id: null, winnerId: null, status: 'finished', result: { type: 'wo' }, finishedAt: '2026-01-01T00:00:00.000Z' }
    const r1Real   = { id: 'r1p2', round: 1, position: 2, athlete1Id: 'a4', athlete2Id: 'a5', winnerId: 'a4', status: 'finished', result: { type: 'points' }, finishedAt: '2026-01-01T00:00:00.000Z' }
    const r2Match  = { id: 'r2p1', round: 2, position: 1, athlete1Id: null, athlete2Id: null, winnerId: null, status: 'pending', result: { type: null }, finishedAt: null }
    const r3Final  = { id: 'r3p0', round: 3, position: 0, athlete1Id: null, athlete2Id: null, winnerId: null, status: 'pending', result: { type: null }, finishedAt: null }
    const matches = [r1Ghost, r1Real, r2Match, r3Final]

    propagateWinner(matches, r1Real)

    // R2pos1 debe resolverse como WO porque su feeder contrario (R1pos3 ghost) ya terminó
    expect(r2Match.status).toBe('finished')
    expect(r2Match.winnerId).toBe('a4')
  })
})

describe('calculatePodium', () => {
  it('retorna estructura correcta tras torneo de 4 atletas completo', () => {
    // Construir matches a mano para un torneo 4-atletas controlado
    const semi1 = { id: 's1', round: 1, position: 0, athlete1Id: 'a1', athlete2Id: 'a2', winnerId: 'a1', status: 'finished', result: { type: 'points' }, finishedAt: '2026-01-01T00:00:00.000Z' }
    const semi2 = { id: 's2', round: 1, position: 1, athlete1Id: 'a3', athlete2Id: 'a4', winnerId: 'a3', status: 'finished', result: { type: 'points' }, finishedAt: '2026-01-01T00:00:00.000Z' }
    const final = { id: 'f1', round: 2, position: 0, athlete1Id: 'a1', athlete2Id: 'a3', winnerId: 'a1', status: 'finished', result: { type: 'points' }, finishedAt: '2026-01-01T00:01:00.000Z' }
    const category = { matches: [semi1, semi2, final] }

    const podium = calculatePodium(category)

    expect(podium.first).toBe('a1')
    expect(podium.second).toBe('a3')
    expect(podium.third).toEqual(expect.arrayContaining(['a2', 'a4']))
    expect(podium.third).toHaveLength(2)
  })
})
