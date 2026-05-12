import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import path from 'path'
import { readJSON, writeJSON } from '../storage/jsonStorage.js'

const router = Router()
const dbPath = () => path.join(process.env.DATA_DIR || './data', 'tournaments.json')

async function getDB() { return readJSON(dbPath(), { tournaments: [] }) }
async function saveDB(db) { return writeJSON(dbPath(), db) }
async function findTournament(id) {
  const db = await getDB()
  const t = db.tournaments.find(t => t.id === id)
  if (!t) return [null, db]
  return [t, db]
}

// --- Torneos ---
router.get('/', async (_, res) => {
  const { tournaments } = await getDB()
  res.json(tournaments)
})

router.post('/', async (req, res) => {
  const { name, date, location } = req.body
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' })

  const db = await getDB()
  const tournament = {
    id: uuid(),
    name,
    date: date || new Date().toISOString().slice(0, 10),
    location: location || 'Grapplers Paradise — Masnou',
    status: 'setup',
    activeCategory: null,
    viewState: 'waiting',
    categories: []
  }
  db.tournaments.push(tournament)
  await saveDB(db)
  res.status(201).json(tournament)
})

router.put('/:id', async (req, res) => {
  const [t, db] = await findTournament(req.params.id)
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' })

  const allowed = ['name', 'date', 'location', 'status']
  allowed.forEach(k => { if (req.body[k] !== undefined) t[k] = req.body[k] })
  await saveDB(db)
  res.json(t)
})

router.delete('/:id', async (req, res) => {
  const db = await getDB()
  db.tournaments = db.tournaments.filter(t => t.id !== req.params.id)
  await saveDB(db)
  res.status(204).end()
})

// --- Categorías ---
router.post('/:id/categories', async (req, res) => {
  const [t, db] = await findTournament(req.params.id)
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' })

  const { name, matchDuration } = req.body
  if (!name) return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' })

  const category = {
    id: uuid(),
    name,
    matchDuration: matchDuration || 300,
    status: 'pending',
    bracketConfirmed: false,
    athleteIds: [],
    matches: [],
    podium: { first: null, second: null, third: [] }
  }
  t.categories.push(category)
  await saveDB(db)
  res.status(201).json(category)
})

router.put('/:id/categories/:catId', async (req, res) => {
  const [t, db] = await findTournament(req.params.id)
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' })

  const cat = t.categories.find(c => c.id === req.params.catId)
  if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' })

  const allowed = ['name', 'matchDuration']
  allowed.forEach(k => { if (req.body[k] !== undefined) cat[k] = req.body[k] })
  await saveDB(db)
  res.json(cat)
})

router.delete('/:id/categories/:catId', async (req, res) => {
  const [t, db] = await findTournament(req.params.id)
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' })

  t.categories = t.categories.filter(c => c.id !== req.params.catId)
  await saveDB(db)
  res.status(204).end()
})

// --- Inscripción de atletas en categoría ---
router.post('/:id/categories/:catId/athletes', async (req, res) => {
  const [t, db] = await findTournament(req.params.id)
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' })

  const cat = t.categories.find(c => c.id === req.params.catId)
  if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' })

  const { athleteId } = req.body
  if (!athleteId) return res.status(400).json({ error: 'athleteId es obligatorio' })
  if (cat.athleteIds.includes(athleteId)) return res.status(409).json({ error: 'Atleta ya inscrito' })

  cat.athleteIds.push(athleteId)
  await saveDB(db)
  res.status(201).json(cat)
})

router.delete('/:id/categories/:catId/athletes/:athleteId', async (req, res) => {
  const [t, db] = await findTournament(req.params.id)
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' })

  const cat = t.categories.find(c => c.id === req.params.catId)
  if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' })

  cat.athleteIds = cat.athleteIds.filter(id => id !== req.params.athleteId)
  await saveDB(db)
  res.status(204).end()
})

export default router
