import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import path from 'path'
import { readJSON, writeJSON } from '../storage/jsonStorage.js'

const router = Router()
const dbPath = () => path.join(process.env.DATA_DIR || './data', 'athletes.json')

router.get('/', async (_, res) => {
  const { athletes } = await readJSON(dbPath(), { athletes: [] })
  res.json(athletes)
})

router.post('/', async (req, res) => {
  const { name, academy, belt, weight, gender } = req.body
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' })

  const { athletes } = await readJSON(dbPath(), { athletes: [] })
  const newAthlete = {
    id: uuid(),
    name,
    academy: academy || 'Grapplers Paradise',
    belt: belt || 'blanco',
    weight: weight || null,
    gender: gender || 'M'
  }
  athletes.push(newAthlete)
  await writeJSON(dbPath(), { athletes })
  res.status(201).json(newAthlete)
})

router.put('/:id', async (req, res) => {
  const { athletes } = await readJSON(dbPath(), { athletes: [] })
  const idx = athletes.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Atleta no encontrado' })

  athletes[idx] = { ...athletes[idx], ...req.body, id: athletes[idx].id }
  await writeJSON(dbPath(), { athletes })
  res.json(athletes[idx])
})

router.delete('/:id', async (req, res) => {
  const db = await readJSON(dbPath(), { athletes: [] })
  db.athletes = db.athletes.filter(a => a.id !== req.params.id)
  await writeJSON(dbPath(), db)
  res.status(204).end()
})

export default router
