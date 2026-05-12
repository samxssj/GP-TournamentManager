import { Router } from 'express'
import path from 'path'
import { readJSON, writeJSON } from '../storage/jsonStorage.js'
import { getIO } from '../socket.js'

const router = Router()
const dbPath = () => path.join(process.env.DATA_DIR || './data', 'tournaments.json')

router.get('/state/:tournamentId', async (req, res) => {
  const db = await readJSON(dbPath(), { tournaments: [] })
  const tournament = db.tournaments.find(t => t.id === req.params.tournamentId)
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' })

  const activeCategory = tournament.categories.find(c => c.id === tournament.activeCategory) || null
  const activeMatch = activeCategory?.matches.find(m => m.status === 'active') || null

  res.json({ viewState: tournament.viewState, tournament, activeCategory, activeMatch })
})

router.put('/state/:tournamentId', async (req, res) => {
  const db = await readJSON(dbPath(), { tournaments: [] })
  const tournament = db.tournaments.find(t => t.id === req.params.tournamentId)
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' })

  const { viewState, activeCategory: catId } = req.body
  if (viewState) tournament.viewState = viewState
  if (catId !== undefined) tournament.activeCategory = catId

  await writeJSON(dbPath(), db)

  const activeCategory = tournament.categories.find(c => c.id === tournament.activeCategory) || null
  const activeMatch = activeCategory?.matches.find(m => m.status === 'active') || null

  getIO().emit('view:state', { viewState: tournament.viewState, tournament, activeCategory, activeMatch })
  res.json({ viewState: tournament.viewState, tournament, activeCategory, activeMatch })
})

export default router
