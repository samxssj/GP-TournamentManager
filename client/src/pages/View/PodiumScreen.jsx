import { motion } from 'framer-motion'
import useTournamentStore from '../../store/tournamentStore.js'

function PodiumPosition({ position, athleteId, athletes, delay }) {
  const athlete = athletes.find(a => a.id === athleteId)
  const heights = { 1: 220, 2: 160, 3: 110 }
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const colors = {
    1: 'linear-gradient(135deg, #ffd700, #ffb300)',
    2: 'linear-gradient(135deg, #c0c0c0, #909090)',
    3: 'linear-gradient(135deg, #cd7f32, #a0522d)'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: delay + 0.3, duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{medals[position]}</div>
        <div style={{ fontSize: position === 1 ? 28 : 22, fontWeight: 900, lineHeight: 1.2 }}>{athlete ? athlete.name : '—'}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{athlete?.academy || '—'}</div>
      </motion.div>
      <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' }}
        style={{
          width: position === 1 ? 220 : 180, height: heights[position],
          background: colors[position], borderRadius: '12px 12px 0 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 16,
          transformOrigin: 'bottom', boxShadow: position === 1 ? '0 0 40px rgba(255,215,0,0.3)' : 'none'
        }}>
        <div style={{ fontSize: position === 1 ? 48 : 36, fontWeight: 900, color: 'rgba(0,0,0,0.3)' }}>{position}</div>
      </motion.div>
    </motion.div>
  )
}

export default function PodiumScreen({ category, athletes: propAthletes }) {
  const storeAthletes = useTournamentStore(s => s.athletes)
  const athletes = propAthletes?.length ? propAthletes : storeAthletes

  if (!category?.podium) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 20 }}>
      Sin podio disponible
    </div>
  )

  const { first, second, third } = category.podium

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center bottom, #1a0a0a 0%, #0a0a0a 70%)',
      overflow: 'hidden', gap: 0
    }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 5, color: 'var(--gp-primary)', textTransform: 'uppercase', marginBottom: 8 }}>Grapplers Paradise</div>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{category.name}</div>
        <div style={{ width: 80, height: 3, background: 'var(--gp-primary)', margin: '16px auto 0', borderRadius: 2, boxShadow: '0 0 16px var(--gp-primary)' }} />
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <PodiumPosition position={3} athleteId={third?.[0]} athletes={athletes} delay={0.2} />
        <PodiumPosition position={1} athleteId={first} athletes={athletes} delay={0.6} />
        <PodiumPosition position={2} athleteId={second} athletes={athletes} delay={0.4} />
        {third?.[1] && <PodiumPosition position={3} athleteId={third[1]} athletes={athletes} delay={0.2} />}
      </div>

      {[...Array(20)].map((_, i) => (
        <motion.div key={i}
          initial={{ y: -20, opacity: 1, x: (i * 97) % 1200 }}
          animate={{ y: 900, opacity: 0, rotate: i * 36 }}
          transition={{ delay: 1 + (i * 0.15), duration: 1.5 + (i % 3) * 0.5, ease: 'linear' }}
          style={{
            position: 'absolute', top: 0,
            width: 8, height: 20,
            background: ['#ffd700', '#c8102e', '#fff', '#22c55e'][i % 4],
            borderRadius: 2
          }}
        />
      ))}
    </div>
  )
}
