import { motion } from 'framer-motion'
import useTournamentStore from '../../store/tournamentStore.js'

export default function WaitingScreen() {
  const { tournaments, activeTournamentId } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0a0a 70%)',
      gap: 40, overflow: 'hidden', position: 'relative'
    }}>
      {[...Array(12)].map((_, i) => (
        <motion.div key={i} style={{
          position: 'absolute',
          width: 80 + (i * 17) % 80,
          height: 80 + (i * 13) % 80,
          borderRadius: '50%',
          background: `rgba(200,16,46,${0.02 + (i % 5) * 0.01})`,
          left: `${(i * 23) % 100}%`,
          top: `${(i * 31) % 100}%`,
          filter: 'blur(40px)'
        }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ textAlign: 'center', zIndex: 1 }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 6, color: 'var(--gp-primary)', textTransform: 'uppercase', marginBottom: 24 }}>GRAPPLERS PARADISE</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase' }}>TOURNAMENT</div>
        <div style={{ width: 120, height: 4, background: 'var(--gp-primary)', borderRadius: 2, margin: '24px auto', boxShadow: '0 0 20px var(--gp-primary)' }} />
        {tournament && (
          <>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{tournament.name}</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{tournament.date} · {tournament.location}</div>
          </>
        )}
      </motion.div>

      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: 'var(--text-muted)', textTransform: 'uppercase', zIndex: 1 }}
      >
        ESPERANDO INICIO
      </motion.div>
    </div>
  )
}
