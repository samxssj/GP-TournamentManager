import { motion, AnimatePresence } from 'framer-motion'
import useTournamentStore from '../../store/tournamentStore.js'

function AnimatedNumber({ value }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span key={value}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }} style={{ display: 'inline-block' }}>
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

export default function ScoreboardScreen({ match, athletes: propAthletes }) {
  const storeAthletes = useTournamentStore(s => s.athletes)
  const matchResult = useTournamentStore(s => s.matchResult)
  const remainingSeconds = useTournamentStore(s => s.remainingSeconds)
  const athletes = propAthletes?.length ? propAthletes : storeAthletes
  const result = matchResult || match?.result

  if (!match) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 20 }}>
      Sin combate activo
    </div>
  )

  const a1 = athletes.find(a => a.id === match.athlete1Id)
  const a2 = athletes.find(a => a.id === match.athlete2Id)
  const r1 = result?.athlete1 || { points: 0, advantages: 0, penalties: 0 }
  const r2 = result?.athlete2 || { points: 0, advantages: 0, penalties: 0 }
  const mm = Math.floor(remainingSeconds / 60)
  const ss = String(remainingSeconds % 60).padStart(2, '0')
  const isLow = remainingSeconds <= 30 && remainingSeconds > 0

  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', background: 'var(--surface-bg)' }}>
      <div style={{ background: 'var(--side-blue-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 48, borderRight: '2px solid rgba(26,86,219,0.3)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{a1?.name?.toUpperCase() || 'TBD'}</div>
          <div style={{ fontSize: 20, color: 'var(--text-secondary)', fontWeight: 500 }}>{a1?.academy || '—'}</div>
        </div>
        <motion.div animate={{ scale: r1.points > r2.points ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 160, fontWeight: 900, lineHeight: 1, color: 'var(--side-blue)', textShadow: '0 0 60px rgba(26,86,219,0.4)' }}>
          <AnimatedNumber value={r1.points} />
        </motion.div>
        <div style={{ display: 'flex', gap: 32, fontSize: 36, fontWeight: 700 }}>
          <div style={{ textAlign: 'center' }}><AnimatedNumber value={r1.advantages} /><div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 4 }}>VEN</div></div>
          <div style={{ textAlign: 'center', color: 'var(--color-danger)' }}><AnimatedNumber value={r1.penalties} /><div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 4 }}>PEN</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 16, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TIEMPO</div>
        <motion.div
          animate={{ color: isLow ? ['var(--color-warning)', 'var(--color-danger)', 'var(--color-warning)'] : 'var(--text-primary)' }}
          transition={{ duration: 0.8, repeat: isLow ? Infinity : 0 }}
          style={{ fontSize: 72, fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 4 }}
        >{mm}:{ss}</motion.div>
        <div style={{ width: 2, flex: 1, background: 'var(--surface-border)', margin: '8px 0' }} />
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 2, textAlign: 'center',
          background: 'var(--gp-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>GRAPPLERS<br />PARADISE</div>
      </div>

      <div style={{ background: 'var(--side-red-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 48, borderLeft: '2px solid rgba(220,38,38,0.3)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{a2?.name?.toUpperCase() || 'TBD'}</div>
          <div style={{ fontSize: 20, color: 'var(--text-secondary)', fontWeight: 500 }}>{a2?.academy || '—'}</div>
        </div>
        <motion.div animate={{ scale: r2.points > r1.points ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 160, fontWeight: 900, lineHeight: 1, color: 'var(--side-red)', textShadow: '0 0 60px rgba(220,38,38,0.4)' }}>
          <AnimatedNumber value={r2.points} />
        </motion.div>
        <div style={{ display: 'flex', gap: 32, fontSize: 36, fontWeight: 700 }}>
          <div style={{ textAlign: 'center' }}><AnimatedNumber value={r2.advantages} /><div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 4 }}>VEN</div></div>
          <div style={{ textAlign: 'center', color: 'var(--color-danger)' }}><AnimatedNumber value={r2.penalties} /><div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 4 }}>PEN</div></div>
        </div>
      </div>
    </div>
  )
}
