import { v4 as uuid } from 'uuid'

function createMatch(round, position, athlete1Id, athlete2Id) {
  return {
    id: uuid(),
    round,
    position,
    athlete1Id: athlete1Id ?? null,
    athlete2Id: athlete2Id ?? null,
    winnerId: null,
    result: {
      type: null,
      athlete1: { points: 0, advantages: 0, penalties: 0 },
      athlete2: { points: 0, advantages: 0, penalties: 0 }
    },
    status: 'pending',
    timerState: 'stopped',
    elapsed: 0,
    startedAt: null,
    finishedAt: null
  }
}

export function propagateWinner(matches, finishedMatch) {
  if (!finishedMatch.winnerId) return

  const nextRound = finishedMatch.round + 1
  const nextPos = Math.floor(finishedMatch.position / 2)
  const nextMatch = matches.find(m => m.round === nextRound && m.position === nextPos)
  if (!nextMatch) return

  const slot = finishedMatch.position % 2 === 0 ? 'athlete1Id' : 'athlete2Id'
  nextMatch[slot] = finishedMatch.winnerId

  // Solo auto-avanzar si el slot contrario está vacío Y su feeder ya está resuelto.
  // Evita el cascade prematuro cuando el feeder contrario todavía no se ha jugado.
  const otherSlot = slot === 'athlete1Id' ? 'athlete2Id' : 'athlete1Id'
  if (nextMatch[otherSlot] === null) {
    const otherFeederPos = otherSlot === 'athlete1Id' ? nextPos * 2 : nextPos * 2 + 1
    const otherFeeder = matches.find(m => m.round === nextRound - 1 && m.position === otherFeederPos)
    const feederAlreadyResolved = !otherFeeder || otherFeeder.status === 'finished'

    if (feederAlreadyResolved) {
      nextMatch.winnerId = nextMatch.athlete1Id || nextMatch.athlete2Id
      nextMatch.status = 'finished'
      nextMatch.result = { ...nextMatch.result, type: 'wo' }
      nextMatch.finishedAt = new Date().toISOString()
      propagateWinner(matches, nextMatch)
    }
  }
}

export function generateBracket(athleteIds) {
  const shuffled = [...athleteIds].sort(() => Math.random() - 0.5)
  const n = shuffled.length

  if (n === 0) return []
  if (n === 1) {
    const m = createMatch(1, 0, shuffled[0], null)
    m.winnerId = shuffled[0]
    m.status = 'finished'
    m.result.type = 'wo'
    return [m]
  }

  const totalRounds = Math.ceil(Math.log2(n))
  const size = Math.pow(2, totalRounds)
  const seeds = [...shuffled, ...Array(size - n).fill(null)]

  const matches = []

  // Ronda 1: se llena con los atletas (y nulls para los byes)
  for (let pos = 0; pos < size / 2; pos++) {
    matches.push(createMatch(1, pos, seeds[pos * 2], seeds[pos * 2 + 1]))
  }

  // Rondas siguientes: slots vacíos, se llenan al propagar ganadores
  for (let round = 2; round <= totalRounds; round++) {
    const roundSize = size / Math.pow(2, round)
    for (let pos = 0; pos < roundSize; pos++) {
      matches.push(createMatch(round, pos, null, null))
    }
  }

  // Resolver byes y ghost matches de izquierda a derecha en R1
  const r1Matches = matches.filter(m => m.round === 1).sort((a, b) => a.position - b.position)

  for (const match of r1Matches) {
    const bothNull = !match.athlete1Id && !match.athlete2Id
    const oneNull = (!match.athlete1Id && !!match.athlete2Id) || (!!match.athlete1Id && !match.athlete2Id)

    if (bothNull) {
      // Ghost match — sin ganador, no se propaga nada
      match.status = 'finished'
      match.result.type = 'wo'
      match.finishedAt = new Date().toISOString()
    } else if (oneNull) {
      // Bye — el atleta real avanza automáticamente
      match.winnerId = match.athlete1Id || match.athlete2Id
      match.status = 'finished'
      match.result.type = 'wo'
      match.finishedAt = new Date().toISOString()
      propagateWinner(matches, match)
    }
  }

  return matches
}

export function calculatePodium(category) {
  const { matches } = category
  const maxRound = Math.max(...matches.map(m => m.round))
  const final = matches.find(m => m.round === maxRound)
  const semis = matches.filter(m => m.round === maxRound - 1)

  const first = final?.winnerId ?? null
  const second = final
    ? (final.winnerId === final.athlete1Id ? final.athlete2Id : final.athlete1Id)
    : null

  // Sin match por el bronce — ambos perdedores de semis comparten el 3er puesto
  if (maxRound === 1) return { first, second, third: [] }

  const third = semis
    .filter(m => m.status === 'finished' && m.athlete1Id && m.athlete2Id)
    .map(m => m.winnerId === m.athlete1Id ? m.athlete2Id : m.athlete1Id)
    .filter(Boolean)

  return { first, second, third }
}
