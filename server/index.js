import 'dotenv/config'
import express from 'express'
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

const app = express()
const httpServer = createServer(app)

initSocket(httpServer)

app.use(express.json())
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

await initStorage()
httpServer.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`))
