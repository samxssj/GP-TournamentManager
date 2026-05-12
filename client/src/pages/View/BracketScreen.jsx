import { motion } from 'framer-motion'
import BracketTree from '../../components/BracketTree.jsx'
import useTournamentStore from '../../store/tournamentStore.js'

export default function BracketScreen({ category, athletes: propAthletes }) {
  const storeAthletes = useTournamentStore(s => s.athletes)
  const athletes = propAthletes?.length ? propAthletes : storeAthletes

  if (!category) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 20 }}>
      Sin categoría seleccionada
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-bg)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 40px 16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: 'var(--gp-primary)', textTransform: 'uppercase', marginBottom: 4 }}>Grapplers Paradise</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{category.name}</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>
          {category.matches.filter(m => m.status === 'finished').length} / {category.matches.filter(m => m.athlete1Id || m.athlete2Id).length} combates
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <BracketTree matches={category.matches} athletes={athletes} />
        </motion.div>
      </div>
    </div>
  )
}
