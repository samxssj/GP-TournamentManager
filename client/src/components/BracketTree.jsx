import { useMemo } from 'react'

function MatchCard({ match, athletes }) {
  const a1 = athletes.find(a => a.id === match.athlete1Id)
  const a2 = athletes.find(a => a.id === match.athlete2Id)
  const isFinished = match.status === 'finished'

  const SlotRow = ({ athlete, isWinner }) => (
    <div style={{
      padding: 'var(--space-2) var(--space-3)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderRadius: 4, marginBottom: 2,
      background: isWinner ? 'rgba(34,197,94,0.1)' : 'transparent',
      opacity: isFinished && !isWinner ? 0.45 : 1
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: isWinner ? 700 : 500, color: athlete ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {athlete ? athlete.name : (match.status === 'pending' ? 'TBD' : 'BYE')}
        </div>
        {athlete && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{athlete.academy}</div>}
      </div>
      {isWinner && <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 700 }}>✓</span>}
    </div>
  )

  return (
    <div style={{
      background: 'var(--surface-02)',
      border: `1px solid ${match.status === 'active' ? 'var(--gp-primary)' : 'var(--surface-border)'}`,
      borderRadius: 'var(--radius-md)', padding: 'var(--space-2)',
      minWidth: 180, width: 180,
      boxShadow: match.status === 'active' ? 'var(--shadow-glow)' : 'none'
    }}>
      <SlotRow athlete={a1} isWinner={match.winnerId === match.athlete1Id && isFinished} />
      <div style={{ height: 1, background: 'var(--surface-border)', margin: '2px 0' }} />
      <SlotRow athlete={a2} isWinner={match.winnerId === match.athlete2Id && isFinished} />
    </div>
  )
}

export default function BracketTree({ matches, athletes }) {
  const rounds = useMemo(() => {
    if (!matches.length) return []
    const maxRound = Math.max(...matches.map(m => m.round))
    return Array.from({ length: maxRound }, (_, i) => ({
      round: i + 1,
      matches: matches.filter(m => m.round === i + 1).sort((a, b) => a.position - b.position)
    }))
  }, [matches])

  if (!matches.length) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 40 }}>Bracket vacío</div>
  )

  const maxRound = Math.max(...matches.map(m => m.round))

  return (
    <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center', overflowX: 'auto', padding: 'var(--space-4)' }}>
      {rounds.map(({ round, matches: rMatches }) => (
        <div key={round} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            {round === maxRound ? 'Final' : `Ronda ${round}`}
          </div>
          {rMatches
            .filter(m => m.athlete1Id || m.athlete2Id || m.status !== 'finished')
            .map(match => (
              <MatchCard key={match.id} match={match} athletes={athletes} />
            ))}
        </div>
      ))}
    </div>
  )
}
