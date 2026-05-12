import { useEffect, useState } from 'react'
import { Plus, Trash2, UserPlus, X } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'

export default function CategoryManager() {
  const { activeTournamentId, tournaments, setTournaments, athletes, setAthletes } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)
  const [catForm, setCatForm] = useState({ name: '', matchDuration: 300 })
  const [showCatForm, setShowCatForm] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [addingAthlete, setAddingAthlete] = useState(false)

  useEffect(() => {
    if (!athletes.length) fetch('/api/athletes').then(r => r.json()).then(setAthletes)
  }, [])

  if (!tournament) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>
      Selecciona un torneo en la sección "Torneos"
    </div>
  )

  async function createCategory(e) {
    e.preventDefault()
    const res = await fetch(`/api/tournaments/${tournament.id}/categories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...catForm, matchDuration: Number(catForm.matchDuration) })
    })
    const cat = await res.json()
    const updated = { ...tournament, categories: [...tournament.categories, cat] }
    setTournaments(tournaments.map(t => t.id === tournament.id ? updated : t))
    setCatForm({ name: '', matchDuration: 300 })
    setShowCatForm(false)
    setSelectedCat(cat.id)
  }

  async function deleteCategory(catId) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`/api/tournaments/${tournament.id}/categories/${catId}`, { method: 'DELETE' })
    const updated = { ...tournament, categories: tournament.categories.filter(c => c.id !== catId) }
    setTournaments(tournaments.map(t => t.id === tournament.id ? updated : t))
    if (selectedCat === catId) setSelectedCat(null)
  }

  async function enrollAthlete(athleteId) {
    const res = await fetch(`/api/tournaments/${tournament.id}/categories/${selectedCat}/athletes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ athleteId })
    })
    const updatedCat = await res.json()
    const updated = { ...tournament, categories: tournament.categories.map(c => c.id === selectedCat ? updatedCat : c) }
    setTournaments(tournaments.map(t => t.id === tournament.id ? updated : t))
    setAddingAthlete(false)
  }

  async function removeAthlete(athleteId) {
    await fetch(`/api/tournaments/${tournament.id}/categories/${selectedCat}/athletes/${athleteId}`, { method: 'DELETE' })
    const updated = {
      ...tournament,
      categories: tournament.categories.map(c =>
        c.id === selectedCat ? { ...c, athleteIds: c.athleteIds.filter(id => id !== athleteId) } : c
      )
    }
    setTournaments(tournaments.map(t => t.id === tournament.id ? updated : t))
  }

  const currentCat = tournament.categories.find(c => c.id === selectedCat)
  const enrolledAthletes = currentCat?.athleteIds.map(id => athletes.find(a => a.id === id)).filter(Boolean) || []
  const availableAthletes = athletes.filter(a => !currentCat?.athleteIds.includes(a.id))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Categorías</h2>
          <button onClick={() => setShowCatForm(true)} style={{ background: 'var(--gp-primary)', color: '#fff', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}><Plus size={12} /></button>
        </div>

        {showCatForm && (
          <form onSubmit={createCategory} style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
            <input required placeholder="Nombre (ej: Blanco -70kg)" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
              style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Tiempo (s):</label>
              <input type="number" min={60} max={600} value={catForm.matchDuration} onChange={e => setCatForm({ ...catForm, matchDuration: e.target.value })}
                style={{ flex: 1, padding: 'var(--space-2)' }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="submit" style={{ background: 'var(--gp-primary)', color: '#fff', padding: 'var(--space-1) var(--space-4)', borderRadius: 4, fontSize: 13, fontWeight: 600 }}>Crear</button>
              <button type="button" onClick={() => setShowCatForm(false)} style={{ background: 'var(--surface-03)', color: 'var(--text-secondary)', padding: 'var(--space-1) var(--space-3)', borderRadius: 4, fontSize: 13 }}>Cancelar</button>
            </div>
          </form>
        )}

        {tournament.categories.map(cat => (
          <div key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{
            background: cat.id === selectedCat ? 'var(--surface-03)' : 'var(--surface-02)',
            border: `1px solid ${cat.id === selectedCat ? 'var(--gp-primary)' : 'var(--surface-border)'}`,
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
            cursor: 'pointer', marginBottom: 'var(--space-2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{cat.athleteIds.length} atletas · {cat.matchDuration}s</div>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteCategory(cat.id) }} style={{ background: 'transparent', color: 'var(--text-muted)', padding: 4 }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div>
        {!currentCat ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)', fontSize: 14 }}>
            Selecciona una categoría para gestionar atletas
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{currentCat.name}</h2>
              <button onClick={() => setAddingAthlete(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--gp-primary)', color: '#fff',
                padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600
              }}><UserPlus size={14} /> Inscribir atleta</button>
            </div>

            {addingAthlete && (
              <div style={{ background: 'var(--surface-02)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Seleccionar atleta</div>
                <div style={{ maxHeight: 200, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {availableAthletes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay atletas disponibles</div>}
                  {availableAthletes.map(a => (
                    <button key={a.id} onClick={() => enrollAthlete(a.id)} style={{
                      background: 'var(--surface-03)', color: 'var(--text-primary)',
                      padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: 14
                    }}>{a.name} — {a.academy} · {a.belt} · {a.weight ? `${a.weight}kg` : '—'}</button>
                  ))}
                </div>
                <button onClick={() => setAddingAthlete(false)} style={{ marginTop: 'var(--space-3)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13 }}>Cerrar</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {enrolledAthletes.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-02)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.academy} · {a.belt}</div>
                    </div>
                  </div>
                  <button onClick={() => removeAthlete(a.id)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: 4 }}><X size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
