import { Monitor, Eye } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'

const VIEW_STATES = [
  { value: 'waiting', label: 'Pantalla de espera', description: 'Logo GP animado' },
  { value: 'bracket', label: 'Bracket', description: 'Árbol de la categoría activa' },
  { value: 'match', label: 'Combate', description: 'Marcador en tiempo real' },
  { value: 'podio', label: 'Podio', description: 'Ceremonia de podio' },
]

export default function ViewControl() {
  const { activeTournamentId, tournaments, viewState } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)

  if (!tournament) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>Selecciona un torneo primero</div>
  )

  async function changeViewState(newState, catId) {
    await fetch(`/api/view/state/${tournament.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewState: newState, activeCategory: catId })
    })
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Control de pantalla</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Gestiona lo que ve la pantalla de la grada en tiempo real</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--surface-02)', border: '1px solid var(--gp-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <Eye size={20} color="var(--gp-primary)" />
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>PANTALLA ACTUAL</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{VIEW_STATES.find(s => s.value === viewState)?.label || viewState}</div>
        </div>
        <a href="/view" target="_blank" style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--surface-03)', color: 'var(--text-secondary)',
          padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)',
          textDecoration: 'none', fontSize: 13, fontWeight: 600
        }}><Monitor size={14} /> Abrir /view</a>
      </div>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-3)' }}>Cambiar pantalla</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {VIEW_STATES.map(({ value, label, description }) => (
            <button key={value} onClick={() => changeViewState(value)} style={{
              background: viewState === value ? 'var(--gp-primary-bg)' : 'var(--surface-02)',
              border: `1px solid ${viewState === value ? 'var(--gp-primary)' : 'var(--surface-border)'}`,
              borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
              textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{description}</div>
            </button>
          ))}
        </div>
      </div>

      {tournament.categories.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-3)' }}>Categoría visible</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {tournament.categories.map(c => (
              <button key={c.id} onClick={() => changeViewState('bracket', c.id)} style={{
                background: tournament.activeCategory === c.id ? 'var(--gp-primary)' : 'var(--surface-02)',
                color: tournament.activeCategory === c.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${tournament.activeCategory === c.id ? 'var(--gp-primary)' : 'var(--surface-border)'}`,
                padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 13
              }}>{c.name}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
