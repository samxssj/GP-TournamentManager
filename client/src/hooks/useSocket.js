import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useTournamentStore from '../store/tournamentStore.js'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io({ transports: ['websocket'] })
  }
  return socket
}

export default function useSocket() {
  const initialized = useRef(false)
  const {
    handleViewState,
    handleMatchUpdated,
    handleMatchTick,
    handleTournamentUpdated
  } = useTournamentStore()

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const s = getSocket()

    s.on('view:state', handleViewState)
    s.on('match:updated', handleMatchUpdated)
    s.on('match:tick', handleMatchTick)
    s.on('tournament:updated', handleTournamentUpdated)

    s.on('connect', () => console.log('[socket] conectado'))
    s.on('disconnect', () => console.log('[socket] desconectado'))

    return () => {
      s.off('view:state', handleViewState)
      s.off('match:updated', handleMatchUpdated)
      s.off('match:tick', handleMatchTick)
      s.off('tournament:updated', handleTournamentUpdated)
    }
  }, [])

  return getSocket()
}
