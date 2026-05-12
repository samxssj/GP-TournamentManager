import { Server } from 'socket.io'

let io

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'development'
        ? ['http://localhost:5173']
        : false
    }
  })

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`)
    socket.on('disconnect', () => console.log(`[socket] disconnected: ${socket.id}`))
  })

  return io
}

export function getIO() {
  if (!io) throw new Error('Socket.io no inicializado. Llama a initSocket primero.')
  return io
}
