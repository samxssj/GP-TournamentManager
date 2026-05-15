import { useEffect, useState, useMemo } from 'react'
import { Shuffle, Check, AlertTriangle, LayoutList } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'
import BracketTree from '../../components/BracketTree.jsx'

function AthleteSelect({ value, onChange, athletes, usedIds }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      style={{
        flex: 1, padding: 'var(--space-2) var(--space-3)',
        background: 'var(--surface-03)', border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 13
      }}
    >
      <option value="">BYE</option>
      {athletes.map(a => (
        <option key={a.id} value={a.id} disabled={usedIds.includes(a.id)}>
          {a.name}{a.academy ? ` — ${a.academy}` : ''}
        </option>
      ))}
    </select>
  )
}

export default function BracketEditor() {
  const { activeTournamentId, tournaments, setTournaments, athletes, setAthletes } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)
  const [selectedCatId, setSelectedCatId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualSeeds, setManualSeeds] = useState([])

  useEffect(() => {
    if (!athletes.length) fetch('/api/athletes').then(r => r.json()).then(setAthletes)
  }, [])

  useEffect(() => {
    if (tournament?.categories.length && !selectedCatId) setSelectedCatId(tournament.categories[0].id)
  }, [tournament?.id])

  useEffect(() => {
    setManualMode(false)
    setManualSeeds([])
    setError('')
  }, [selectedCatId])

  if (!tournament) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>Selecciona un torneo primero</div>
  )

  const category = tournament.categories.find(c => c.id === selectedCatId)

  const bracketSize = useMemo(() => {
    if (!category || category.athleteIds.length < 2) return 0
    const n = category.athleteIds.length
    return Math.pow(2, Math.ceil(Math.log2(n)))
  }, [category?.id, category?.athleteIds?.length])

  const categoryAthletes = category ? athletes.filter(a => category.athleteIds.includes(a.id)) : []
  const numR1Matches = bracketSize / 2
  const assignedCount = manualSeeds.filter(Boolean).length

  function startManualMode() {
    setManualSeeds(Array(bracketSize).fill(null))
    setManualMode(true)
    setError('')
  }

  function updateSeed(index, athleteId) {
    setManualSeeds(prev => {
      const next = [...prev]
      if (athleteId) {
        const prevIdx = next.findIndex(id => id === athleteId)
        if (prevIdx !== -1) next[prevIdx] = null
      }
      next[index] = athleteId
      return next
    })
  }

  function updateCategory(updatedCat) {
    const updated = { ...tournament, categories: tournament.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }
    setTournaments(tournaments.map(t => t.id === tournament.id ? updated : t))
  }

  async function generateRandom() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/categories/${selectedCatId}/generate`, { method: 'POST' })
      if (!res.ok) { const e = await res.json(); setError(e.error); return }
      updateCategory(await res.json())
    } catch { setError('Error generando bracket') }
    finally { setLoading(false) }
  }

  async function generateManual() {
    if (assignedCount !== category.athleteIds.length) {
      setError(`Faltan ${category.athleteIds.length - assignedCount} atletas por asignar`)
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/categories/${selectedCatId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: manualSeeds })
      })
      if (!res.ok) { const e = await res.json(); setError(e.error); return }
      updateCategory(await res.json())
      setManualMode(false)
    } catch { setError('Error generando bracket') }
    finally { setLoading(false) }
  }

  async function confirmBracket() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/categories/${selectedCatId}/confirm`, { method: 'POST' })
      if (!res.ok) { const e = await res.json(); setError(e.error); return }
      updateCategory(await res.json())
    } catch { setError('Error confirmando bracket') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Bracket</h1>

        {category && !category.bracketConfirmed && !manualMode && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={generateRandom} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface-03)', color: 'var(--text-primary)',
              padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: 14, border: '1px solid var(--surface-border)'
            }}><Shuffle size={16} /> Aleatorio</button>
            <button onClick={startManualMode} disabled={loading || !bracketSize} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface-03)', color: 'var(--text-primary)',
              padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: 14, border: '1px solid var(--surface-border)'
            }}><LayoutList size={16} /> Manual</button>
            {category.matches.length > 0 && (
              <button onClick={confirmBracket} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-success)', color: '#fff',
                padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 14
              }}><Check size={16} /> Confirmar y publicar</button>
            )}
          </div>
        )}

        {manualMode && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {assignedCount}/{category.athleteIds.length} atletas asignados
            </span>
            <button onClick={() => { setManualMode(false); setError('') }} style={{
              background: 'var(--surface-03)', color: 'var(--text-secondary)',
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: 14, border: '1px solid var(--surface-border)'
            }}>Cancelar</button>
            <button onClick={generateManual} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-success)', color: '#fff',
              padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 14
            }}><Check size={16} /> Generar bracket</button>
          </div>
        )}

        {category?.bracketConfirmed && (
          <span style={{
            background: 'rgba(34,197,94,0.15)', color: 'var(--color-success)',
            border: '1px solid var(--color-success)',
            padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600
          }}>✓ Bracket confirmado</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {tournament.categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCatId(c.id)} style={{
            padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)',
            background: c.id === selectedCatId ? 'var(--gp-primary)' : 'var(--surface-02)',
            color: c.id === selectedCatId ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${c.id === selectedCatId ? 'var(--gp-primary)' : 'var(--surface-border)'}`,
            fontWeight: 600, fontSize: 13
          }}>{c.name}</button>
        ))}
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
          color: 'var(--color-danger)', marginBottom: 'var(--space-4)', fontSize: 14
        }}><AlertTriangle size={16} /> {error}</div>
      )}

      {manualMode && category && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Primera ronda — {numR1Matches} combates · {bracketSize} plazas · {bracketSize - category.athleteIds.length} BYEs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {Array.from({ length: numR1Matches }, (_, i) => {
              const s1 = i * 2
              const s2 = i * 2 + 1
              const usedExcept1 = manualSeeds.filter((id, idx) => idx !== s1 && id)
              const usedExcept2 = manualSeeds.filter((id, idx) => idx !== s2 && id)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  background: 'var(--surface-02)', border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 36, letterSpacing: 1 }}>
                    R1-{i + 1}
                  </div>
                  <AthleteSelect
                    value={manualSeeds[s1]}
                    onChange={v => updateSeed(s1, v)}
                    athletes={categoryAthletes}
                    usedIds={usedExcept1}
                  />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>vs</div>
                  <AthleteSelect
                    value={manualSeeds[s2]}
                    onChange={v => updateSeed(s2, v)}
                    athletes={categoryAthletes}
                    usedIds={usedExcept2}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!manualMode && category && (
        <div style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', overflowX: 'auto' }}>
          <BracketTree matches={category.matches} athletes={athletes} />
        </div>
      )}
    </div>
  )
}
