import { Router } from 'express'
import path from 'path'
import { readJSON, writeJSON } from '../storage/jsonStorage.js'
import { generateBracket, buildBracketFromSeeds } from '../services/bracketService.js'
import { getIO } from '../socket.js'

const router = Router()
const dbPath = () => path.join(process.env.DATA_DIR || './data', 'tournaments.json')

async function getContext(tournamentId, categoryId) {
  const db = await readJSON(dbPath(), { tournaments: [] })
  const tournament = db.tournaments.find(t => t.id === tournamentId)
  if (!tournament) return [null, null, db]
  const category = tournament.categories.find(c => c.id === categoryId)
  return [tournament, category, db]
}

router.post('/tournaments/:tId/categories/:catId/generate', async (req, res) => {
  const [tournament, category, db] = await getContext(req.params.tId, req.params.catId)
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' })
  if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
  if (category.bracketConfirmed) return res.status(409).json({ error: 'El bracket ya está confirmado' })
  if (category.athleteIds.length < 2) return res.status(400).json({ error: 'Se necesitan al menos 2 atletas' })

  const { order } = req.body || {}
  if (Array.isArray(order)) {
    const nonNullIds = order.filter(Boolean)
    const invalidIds = nonNullIds.filter(id => !category.athleteIds.includes(id))
    const missingIds = category.athleteIds.filter(id => !nonNullIds.includes(id))
    if (invalidIds.length > 0) return res.status(400).json({ error: 'IDs de atleta inválidos en order' })
    if (missingIds.length > 0) return res.status(400).json({ error: `Faltan atletas: ${missingIds.join(', ')}` })
    category.matches = buildBracketFromSeeds(order)
  } else {
    category.matches = generateBracket(category.athleteIds)
  }

  await writeJSON(dbPath(), db)
  res.json(category)
})

router.put('/tournaments/:tId/categories/:catId/bracket', async (req, res) => {
  const [tournament, category, db] = await getContext(req.params.tId, req.params.catId)
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' })
  if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
  if (category.bracketConfirmed) return res.status(409).json({ error: 'El bracket ya está confirmado' })

  const { matches } = req.body
  if (!Array.isArray(matches)) return res.status(400).json({ error: 'matches debe ser un array' })

  category.matches = matches
  await writeJSON(dbPath(), db)
  res.json(category)
})

router.post('/tournaments/:tId/categories/:catId/confirm', async (req, res) => {
  const [tournament, category, db] = await getContext(req.params.tId, req.params.catId)
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' })
  if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
  if (category.matches.length === 0) return res.status(400).json({ error: 'El bracket está vacío' })

  category.bracketConfirmed = true
  category.status = 'active'
  tournament.status = 'active'
  tournament.activeCategory = category.id
  tournament.viewState = 'bracket'

  await writeJSON(dbPath(), db)

  getIO().emit('view:state', {
    viewState: 'bracket',
    tournament,
    activeCategory: category,
    activeMatch: null
  })

  res.json(category)
})

export default router
