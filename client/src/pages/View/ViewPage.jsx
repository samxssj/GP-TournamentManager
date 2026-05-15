import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useSocket from '../../hooks/useSocket.js'
import useTournamentStore from '../../store/tournamentStore.js'
import WaitingScreen from './WaitingScreen.jsx'
import BracketScreen from './BracketScreen.jsx'
import ScoreboardScreen from './ScoreboardScreen.jsx'
import PodiumScreen from './PodiumScreen.jsx'

const SCREENS = { waiting: WaitingScreen, bracket: BracketScreen, match: ScoreboardScreen, podio: PodiumScreen }
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

export default function ViewPage() {
  useSocket()
  const { viewState, activeCategory, activeMatch } = useTournamentStore()
  const storeAthletes = useTournamentStore(s => s.athletes)
  const setAthletes = useTournamentStore(s => s.setAthletes)

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!storeAthletes.length) {
      fetch('/api/athletes').then(r => r.json()).then(setAthletes).catch(() => {})
    }
  }, [])

  const Screen = SCREENS[viewState] || WaitingScreen

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--surface-bg)', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.div key={viewState} {...fade} style={{ position: 'absolute', inset: 0 }}>
          <Screen category={activeCategory} match={activeMatch} athletes={storeAthletes} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
