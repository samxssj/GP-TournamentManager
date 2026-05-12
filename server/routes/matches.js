import { Router } from 'express'
import path from 'path'
import { readJSON, writeJSON } from '../storage/jsonStorage.js'
import { applyScore, finishMatch, determineWinnerByPoints } from '../services/matchService.js'
import { startTimer, stopTimer } from '../services/timerService.js'
import { getIO } from '../socket.js'

const router = Router()
const dbPath = () => path.join(process.env.DATA_DIR || './data', 'tournaments.json')

async function findMatch(matchId) {
  const db = await readJSON(dbPath(), { tournaments: [] })
  for (const tournament of db.tournaments) {
    for (const category of tournament.categories) {
      const match = category.matches.find(m => m.id === matchId)
      if (match) return { match, category, tournament, db }
    }
  }
  return null
}

router.post('/:matchId/start', async (req, res) => {
  const ctx = await findMatch(req.params.matchId)
  if (!ctx) return res.status(404).json({ error: 'Combate no encontrado' })
  const { match, category, tournament, db } = ctx

  if (match.status === 'finished') return res.status(409).json({ error: 'El combate ya finalizó' })

  match.status = 'active'
  match.timerState = 'running'
  match.elapsed = req.body.elapsed || 0
  match.startedAt = new Date().toISOString()
  tournament.viewState = 'match'

  await writeJSON(dbPath(), db)

  startTimer(match.id, category.matchDuration, match.elapsed)

  getIO().emit('view:state', {
    viewState: 'match',
    tournament,
    activeCategory: category,
    activeMatch: match
  })

  res.json(match)
})

router.post('/:matchId/pause', async (req, res) => {
  const ctx = await findMatch(req.params.matchId)
  if (!ctx) return res.status(404).json({ error: 'Combate no encontrado' })
  const { match, db } = ctx

  const elapsed = req.body.elapsed || 0
  match.timerState = 'paused'
  match.elapsed = elapsed

  stopTimer()
  await writeJSON(dbPath(), db)
  getIO().emit('match:updated', { match })
  res.json(match)
})

router.post('/:matchId/resume', async (req, res) => {
  const ctx = await findMatch(req.params.matchId)
  if (!ctx) return res.status(404).json({ error: 'Combate no encontrado' })
  const { match, category, db } = ctx

  match.timerState = 'running'
  await writeJSON(dbPath(), db)

  startTimer(match.id, category.matchDuration, match.elapsed)
  getIO().emit('match:updated', { match })
  res.json(match)
})

router.post('/:matchId/score', async (req, res) => {
  const ctx = await findMatch(req.params.matchId)
  if (!ctx) return res.status(404).json({ error: 'Combate no encontrado' })
  const { match, db } = ctx

  const { slot, field, delta } = req.body
  if (!slot || !field || delta === undefined) {
    return res.status(400).json({ error: 'slot, field y delta son obligatorios' })
  }

  match.result = applyScore(match.result, slot, field, delta)
  await writeJSON(dbPath(), db)
  getIO().emit('match:updated', { match })
  res.json(match)
})

router.post('/:matchId/finish', async (req, res) => {
  const ctx = await findMatch(req.params.matchId)
  if (!ctx) return res.status(404).json({ error: 'Combate no encontrado' })
  const { match, category, tournament, db } = ctx

  const { type, winnerId } = req.body
  if (!type) return res.status(400).json({ error: 'type es obligatorio' })

  let resolvedWinner = winnerId
  if (type === 'points' && !winnerId) {
    resolvedWinner = determineWinnerByPoints(match.result, match.athlete1Id, match.athlete2Id)
  }
  if (!resolvedWinner && type !== 'draw') {
    return res.status(400).json({ error: 'winnerId es obligatorio para este tipo de resultado' })
  }

  stopTimer()
  finishMatch(tournament, category.id, match.id, { type, winnerId: resolvedWinner })

  if (category.status === 'finished') {
    tournament.viewState = 'podium'
    getIO().emit('view:state', {
      viewState: 'podium',
      tournament,
      activeCategory: category,
      activeMatch: null
    })
  } else {
    tournament.viewState = 'bracket'
    getIO().emit('view:state', {
      viewState: 'bracket',
      tournament,
      activeCategory: category,
      activeMatch: null
    })
  }

  await writeJSON(dbPath(), db)
  getIO().emit('match:updated', { match })
  getIO().emit('tournament:updated', { tournament })
  res.json({ match, tournament })
})

export default router
