import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { initSocket } from './socket.js'
import { initStorage } from './storage/jsonStorage.js'
import athletesRouter from './routes/athletes.js'
import tournamentsRouter from './routes/tournaments.js'
import bracketsRouter from './routes/brackets.js'
import matchesRouter from './routes/matches.js'
import viewRouter from './routes/view.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

const corsOrigin = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173'
  : (process.env.CORS_ORIGIN || false)

const app = express()
const httpServer = createServer(app)

initSocket(httpServer)

app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '100kb' }))
app.use('/api/athletes', athletesRouter)
app.use('/api/tournaments', tournamentsRouter)
app.use('/api', bracketsRouter)
app.use('/api/matches', matchesRouter)
app.use('/api/view', viewRouter)

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get(/^(?!\/api).*/, (_, res) =>
    res.sendFile(path.join(clientDist, 'index.html'))
  )
}

try {
  await initStorage()
  httpServer.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`))
} catch (err) {
  console.error('[server] Error fatal al arrancar:', err)
  process.exit(1)
}
