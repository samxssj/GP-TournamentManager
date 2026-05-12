import { getIO } from '../socket.js'

let activeTimer = null
let activeMatchId = null

export function startTimer(matchId, matchDuration, elapsed = 0) {
  stopTimer()
  activeMatchId = matchId
  const startedAt = Date.now() - elapsed * 1000

  activeTimer = setInterval(() => {
    const currentElapsed = Math.floor((Date.now() - startedAt) / 1000)
    const remaining = Math.max(0, matchDuration - currentElapsed)
    getIO().emit('match:tick', { matchId, remaining })

    if (remaining === 0) {
      stopTimer()
      getIO().emit('match:timeout', { matchId })
    }
  }, 1000)

  return startedAt
}

export function stopTimer() {
  if (activeTimer) {
    clearInterval(activeTimer)
    activeTimer = null
    activeMatchId = null
  }
}

export function getActiveMatchId() {
  return activeMatchId
}
