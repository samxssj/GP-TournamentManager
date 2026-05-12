import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import useTournamentStore from '../../store/tournamentStore.js'

const BELTS = ['blanco', 'azul', 'morado', 'marrón', 'negro']
const GENDERS = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }]
const emptyForm = { name: '', academy: 'Grapplers Paradise', belt: 'blanco', weight: '', gender: 'M' }

export default function AthletesPanel() {
  const { athletes, setAthletes } = useTournamentStore()
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/athletes').then(r => r.json()).then(setAthletes)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, weight: form.weight ? Number(form.weight) : null }
    if (editing) {
      const res = await fetch(`/api/athletes/${editing}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const updated = await res.json()
      setAthletes(athletes.map(a => a.id === editing ? updated : a))
      setEditing(null)
    } else {
      const res = await fetch('/api/athletes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const created = await res.json()
      setAthletes([...athletes, created])
    }
    setForm(emptyForm)
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar atleta?')) return
    await fetch(`/api/athletes/${id}`, { method: 'DELETE' })
    setAthletes(athletes.filter(a => a.id !== id))
  }

  function startEdit(athlete) {
    setForm({ ...athlete, weight: athlete.weight || '' })
    setEditing(athlete.id)
    setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Atletas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{athletes.length} atletas registrados</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--gp-primary)', color: '#fff',
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 14
        }}><Plus size={16} /> Nuevo atleta</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--surface-02)', border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)'
        }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 16 }}>{editing ? 'Editar atleta' : 'Nuevo atleta'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {[
              { key: 'name', label: 'Nombre *', type: 'text', required: true, placeholder: 'Juan García' },
              { key: 'academy', label: 'Academia', type: 'text', placeholder: 'Grapplers Paradise' },
              { key: 'weight', label: 'Peso (kg)', type: 'number', placeholder: '70' }
            ].map(({ key, label, type, required, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} required={required} value={form[key]} placeholder={placeholder}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: 'var(--space-3)' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Cinturón</label>
              <select value={form.belt} onChange={e => setForm({ ...form, belt: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-3)' }}>
                {BELTS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Género</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-3)' }}>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" style={{ background: 'var(--gp-primary)', color: '#fff', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>{editing ? 'Guardar' : 'Crear'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} style={{ background: 'var(--surface-03)', color: 'var(--text-secondary)', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-sm)' }}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {athletes.map(a => (
          <div key={a.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--surface-02)', border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {a.academy} · {a.belt} · {a.weight ? `${a.weight}kg` : '—'} · {a.gender === 'M' ? 'Masc.' : 'Fem.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={() => startEdit(a)} style={{ background: 'var(--surface-03)', color: 'var(--text-secondary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}><Pencil size={14} /></button>
              <button onClick={() => handleDelete(a.id)} style={{ background: 'transparent', color: 'var(--color-danger)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
