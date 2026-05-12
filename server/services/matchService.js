import { propagateWinner, calculatePodium } from './bracketService.js'

/**
 * Aplica un delta (positivo o negativo) a un campo del resultado de un slot.
 * Inmutable: retorna un nuevo objeto result sin mutar el original.
 * El valor nunca baja de 0 (no se puede deshacer más de lo acumulado).
 */
export function applyScore(result, slot, field, delta) {
  const current = result[slot][field]
  return {
    ...result,
    [slot]: {
      ...result[slot],
      [field]: Math.max(0, current + delta)
    }
  }
}

/**
 * Determina el ganador por puntos según las reglas BJJ:
 * 1. Más puntos
 * 2. Más ventajas (en caso de empate en puntos)
 * 3. Menos penalizaciones (en caso de empate en puntos y ventajas)
 * 4. null — empate total, el árbitro decide
 */
export function determineWinnerByPoints(result, athlete1Id, athlete2Id) {
  const a1 = result.athlete1
  const a2 = result.athlete2

  if (a1.points !== a2.points) return a1.points > a2.points ? athlete1Id : athlete2Id
  if (a1.advantages !== a2.advantages) return a1.advantages > a2.advantages ? athlete1Id : athlete2Id
  if (a1.penalties !== a2.penalties) return a1.penalties < a2.penalties ? athlete1Id : athlete2Id
  return null
}

/**
 * Finaliza un combate, propaga el ganador por el bracket
 * y calcula el podio si todos los combates de la categoría terminaron.
 */
export function finishMatch(tournament, categoryId, matchId, { type, winnerId }) {
  const category = tournament.categories.find(c => c.id === categoryId)
  if (!category) throw new Error(`Categoría ${categoryId} no encontrada`)

  const match = category.matches.find(m => m.id === matchId)
  if (!match) throw new Error(`Combate ${matchId} no encontrado`)
  if (match.status === 'finished') throw new Error('El combate ya está finalizado')

  match.status = 'finished'
  match.finishedAt = new Date().toISOString()
  match.result.type = type
  match.winnerId = winnerId

  propagateWinner(category.matches, match)

  // Si todos los combates con atletas reales ya terminaron, calcular podio
  const allDone = category.matches
    .filter(m => m.athlete1Id || m.athlete2Id)
    .every(m => m.status === 'finished')

  if (allDone) {
    category.podium = calculatePodium(category)
    category.status = 'finished'
  }

  return tournament
}
