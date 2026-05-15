import { useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'
import Timer from '../../components/Timer.jsx'

const SCORE_ACTIONS = [
  { label: '+2', delta: 2, field: 'points', title: 'Takedown / Barrido' },
  { label: '+3', delta: 3, field: 'points', title: 'Paso de guardia' },
  { label: '+4', delta: 4, field: 'points', title: 'Montada / Espalda' },
  { label: '+A', delta: 1, field: 'advantages', title: 'Ventaja' },
  { label: '+P', delta: 1, field: 'penalties', title: 'Penalización' },
]

const UNDO_ACTIONS = [
  { label: '-2', delta: -2, field: 'points' },
  { label: '-3', delta: -3, field: 'points' },
  { label: '-4', delta: -4, field: 'points' },
  { label: '-A', delta: -1, field: 'advantages' },
  { label: '-P', delta: -1, field: 'penalties' },
]

export default function MatchPanel() {
  const { activeTournamentId, tournaments, setTournaments, athletes, setAthletes, activeMatch, matchResult, remainingSeconds } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)
  const [selectedCatId, setSelectedCatId] = useState(null)
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    if (!athletes.length) fetch('/api/athletes').then(r => r.json()).then(setAthletes)
  }, [])

  useEffect(() => {
    if (activeMatch) {
      setSelectedMatchId(activeMatch.id)
      setTimerRunning(activeMatch.timerState === 'running')
    }
  }, [activeMatch?.id])

  if (!tournament) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>Selecciona un torneo primero</div>
  )

  const category = tournament.categories.find(c => c.id === selectedCatId)
  const pendingMatches = category?.matches.filter(m => m.status === 'pending' && m.athlete1Id && m.athlete2Id) || []
  const currentMatch = category?.matches.find(m => m.id === selectedMatchId) || activeMatch
  const athlete1 = currentMatch ? athletes.find(a => a.id === currentMatch.athlete1Id) : null
  const athlete2 = currentMatch ? athletes.find(a => a.id === currentMatch.athlete2Id) : null
  const result = matchResult || currentMatch?.result

  async function refetchTournament() {
    const all = await fetch('/api/tournaments').then(r => r.json())
    useTournamentStore.getState().setTournaments(all)
  }

  async function startMatch() {
    await fetch(`/api/matches/${currentMatch.id}/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ elapsed: 0 }) })
    setTimerRunning(true)
    refetchTournament()
  }

  async function pauseMatch() {
    const elapsed = category.matchDuration - remainingSeconds
    await fetch(`/api/matches/${currentMatch.id}/pause`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ elapsed }) })
    setTimerRunning(false)
  }

  async function resumeMatch() {
    await fetch(`/api/matches/${currentMatch.id}/resume`, { method: 'POST' })
    setTimerRunning(true)
  }

  async function score(slot, field, delta) {
    await fetch(`/api/matches/${currentMatch.id}/score`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot, field, delta })
    })
  }

  async function finishMatch(type, winnerId) {
    await fetch(`/api/matches/${currentMatch.id}/finish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, winnerId })
    })
    setTimerRunning(false)
    setSelectedMatchId(null)
    setSelectedCatId(null)
    refetchTournament()
  }

  const ScorePanel = ({ slot, athlete, side }) => {
    const sideColor = side === 'left' ? 'var(--side-blue)' : 'var(--side-red)'
    const sideBg = side === 'left' ? 'var(--side-blue-bg)' : 'var(--side-red-bg)'
    const r = result?.[slot] || { points: 0, advantages: 0, penalties: 0 }
    return (
      <div style={{ flex: 1, background: sideBg, border: `1px solid ${sideColor}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{athlete?.name || 'TBD'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{athlete?.academy || '—'}</div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: sideColor }}>{r.points}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>PTS</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', paddingBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{r.advantages}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>VEN</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-danger)' }}>{r.penalties}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>PEN</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {SCORE_ACTIONS.map(({ label, delta, field, title }) => (
            <button key={label} onClick={() => score(slot, field, delta)} title={title} style={{
              background: sideColor, color: '#fff', width: 52, height: 52, borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: 16
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {UNDO_ACTIONS.map(({ label, delta, field }) => (
            <button key={label} onClick={() => score(slot, field, delta)} style={{
              background: 'var(--surface-03)', color: 'var(--text-secondary)', width: 44, height: 36, borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13
            }}>{label}</button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Combate</h1>
      </div>

      {!currentMatch && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Categoría</label>
            <select value={selectedCatId || ''} onChange={e => setSelectedCatId(e.target.value)} style={{ width: '100%', padding: 'var(--space-3)' }}>
              <option value="">Seleccionar...</option>
              {tournament.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {category && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Combate</label>
              <select value={selectedMatchId || ''} onChange={e => setSelectedMatchId(e.target.value)} style={{ width: '100%', padding: 'var(--space-3)' }}>
                <option value="">Seleccionar...</option>
                {pendingMatches.map(m => {
                  const a1 = athletes.find(a => a.id === m.athlete1Id)
                  const a2 = athletes.find(a => a.id === m.athlete2Id)
                  return <option key={m.id} value={m.id}>R{m.round}-{m.position+1}: {a1?.name} vs {a2?.name}</option>
                })}
              </select>
            </div>
          )}
        </div>
      )}

      {currentMatch && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <Timer seconds={remainingSeconds || (category?.matchDuration || 300)} size="md" />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {currentMatch.status === 'pending' && (
                <button onClick={startMatch} style={{ background: 'var(--color-success)', color: '#fff', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}><Play size={16} /></button>
              )}
              {currentMatch.status === 'active' && timerRunning && (
                <button onClick={pauseMatch} style={{ background: 'var(--color-warning)', color: '#fff', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}><Pause size={16} /></button>
              )}
              {currentMatch.status === 'active' && !timerRunning && (
                <button onClick={resumeMatch} style={{ background: 'var(--color-success)', color: '#fff', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}><Play size={16} /></button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <ScorePanel slot="athlete1" athlete={athlete1} side="left" />
            <ScorePanel slot="athlete2" athlete={athlete2} side="right" />
          </div>

          {currentMatch.status !== 'finished' && (
            <div style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>FINALIZAR COMBATE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <button onClick={() => finishMatch('submission', athlete1?.id)} style={{ background: 'var(--side-blue)', color: '#fff', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>Sumisión {athlete1?.name?.split(' ')[0]}</button>
                <button onClick={() => finishMatch('submission', athlete2?.id)} style={{ background: 'var(--side-red)', color: '#fff', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>Sumisión {athlete2?.name?.split(' ')[0]}</button>
                <button onClick={() => finishMatch('points', null)} style={{ background: 'var(--surface-03)', color: 'var(--text-primary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13, border: '1px solid var(--surface-border)' }}>Fin de tiempo (puntos)</button>
                <button onClick={() => finishMatch('wo', athlete2?.id)} style={{ background: 'var(--surface-03)', color: 'var(--text-muted)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>WO {athlete1?.name?.split(' ')[0]}</button>
                <button onClick={() => finishMatch('wo', athlete1?.id)} style={{ background: 'var(--surface-03)', color: 'var(--text-muted)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>WO {athlete2?.name?.split(' ')[0]}</button>
                <button onClick={() => finishMatch('dq', athlete2?.id)} style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>DQ {athlete1?.name?.split(' ')[0]}</button>
                <button onClick={() => finishMatch('dq', athlete1?.id)} style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>DQ {athlete2?.name?.split(' ')[0]}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
