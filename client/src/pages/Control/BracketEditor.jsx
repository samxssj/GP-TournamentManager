import { useEffect, useState } from 'react'
import { Shuffle, Check, AlertTriangle } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'
import BracketTree from '../../components/BracketTree.jsx'

export default function BracketEditor() {
  const { activeTournamentId, tournaments, setTournaments, athletes, setAthletes } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)
  const [selectedCatId, setSelectedCatId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!athletes.length) fetch('/api/athletes').then(r => r.json()).then(setAthletes)
  }, [])

  useEffect(() => {
    if (tournament?.categories.length && !selectedCatId) setSelectedCatId(tournament.categories[0].id)
  }, [tournament?.id])

  if (!tournament) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>Selecciona un torneo primero</div>
  )

  const category = tournament.categories.find(c => c.id === selectedCatId)

  function updateCategory(updatedCat) {
    const updated = { ...tournament, categories: tournament.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }
    setTournaments(tournaments.map(t => t.id === tournament.id ? updated : t))
  }

  async function generateBracket() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/categories/${selectedCatId}/generate`, { method: 'POST' })
      if (!res.ok) { const e = await res.json(); setError(e.error); return }
      updateCategory(await res.json())
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
        {category && !category.bracketConfirmed && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={generateBracket} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface-03)', color: 'var(--text-primary)',
              padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: 14, border: '1px solid var(--surface-border)'
            }}><Shuffle size={16} /> Aleatorio</button>
            {category.matches.length > 0 && (
              <button onClick={confirmBracket} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-success)', color: '#fff',
                padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 14
              }}><Check size={16} /> Confirmar y publicar</button>
            )}
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

      {category && (
        <div style={{ background: 'var(--surface-01)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', overflowX: 'auto' }}>
          <BracketTree matches={category.matches} athletes={athletes} />
        </div>
      )}
    </div>
  )
}
