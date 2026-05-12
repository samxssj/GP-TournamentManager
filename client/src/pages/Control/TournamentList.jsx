import { useEffect, useState } from 'react'
import { Plus, Trophy } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'

const statusLabel = { setup: 'Preparación', active: 'Activo', finished: 'Finalizado' }
const statusColor = {
  setup: 'var(--text-muted)',
  active: 'var(--color-success)',
  finished: 'var(--text-secondary)'
}

export default function TournamentList() {
  const { tournaments, setTournaments, activeTournamentId, setActiveTournamentId } = useTournamentStore()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', location: '' })

  useEffect(() => {
    fetch('/api/tournaments')
      .then(r => r.json())
      .then(setTournaments)
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const t = await res.json()
    setTournaments([...tournaments, t])
    setActiveTournamentId(t.id)
    setCreating(false)
    setForm({ name: '', date: '', location: '' })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este torneo?')) return
    await fetch(`/api/tournaments/${id}`, { method: 'DELETE' })
    setTournaments(tournaments.filter(t => t.id !== id))
    if (activeTournamentId === id) setActiveTournamentId(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Torneos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Selecciona un torneo activo o crea uno nuevo
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--gp-primary)', color: '#fff',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 14
          }}
        >
          <Plus size={16} /> Nuevo torneo
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} style={{
          background: 'var(--surface-02)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)', marginBottom: 'var(--space-6)'
        }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 16 }}>Nuevo torneo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Copa Primavera 2026" style={{ width: '100%', padding: 'var(--space-3)' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-3)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Lugar</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Grapplers Paradise — Masnou" style={{ width: '100%', padding: 'var(--space-3)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" style={{
              background: 'var(--gp-primary)', color: '#fff',
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--radius-sm)', fontWeight: 600
            }}>Crear</button>
            <button type="button" onClick={() => setCreating(false)} style={{
              background: 'var(--surface-03)', color: 'var(--text-secondary)',
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--radius-sm)'
            }}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {tournaments.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)', fontSize: 14 }}>
            No hay torneos. Crea uno para empezar.
          </div>
        )}
        {tournaments.map(t => (
          <div key={t.id} style={{
            background: t.id === activeTournamentId ? 'var(--surface-03)' : 'var(--surface-02)',
            border: `1px solid ${t.id === activeTournamentId ? 'var(--gp-primary)' : 'var(--surface-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', transition: 'all var(--transition-fast)'
          }} onClick={() => setActiveTournamentId(t.id)}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Trophy size={16} color="var(--gp-primary)" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</span>
                {t.id === activeTournamentId && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    background: 'var(--gp-primary)', color: '#fff',
                    padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase'
                  }}>Activo</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {t.date} · {t.location} · {t.categories?.length || 0} categorías
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: statusColor[t.status] }}>
                {statusLabel[t.status]}
              </span>
              <button onClick={e => { e.stopPropagation(); handleDelete(t.id) }} style={{
                background: 'transparent', color: 'var(--text-muted)', padding: 'var(--space-1) var(--space-2)', fontSize: 12
              }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
