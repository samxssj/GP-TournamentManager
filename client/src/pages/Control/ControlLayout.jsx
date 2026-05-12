import { NavLink, Outlet } from 'react-router-dom'
import {
  Trophy, Users, Layout, Swords, Monitor, UserSquare
} from 'lucide-react'
import useSocket from '../../hooks/useSocket.js'
import useTournamentStore from '../../store/tournamentStore.js'

const navItems = [
  { to: '/control/tournaments', icon: Trophy, label: 'Torneos' },
  { to: '/control/athletes', icon: Users, label: 'Atletas' },
  { to: '/control/categories', icon: UserSquare, label: 'Categorías' },
  { to: '/control/bracket', icon: Layout, label: 'Bracket' },
  { to: '/control/match', icon: Swords, label: 'Combate' },
  { to: '/control/screen', icon: Monitor, label: 'Pantalla' },
]

export default function ControlLayout() {
  useSocket()
  const { getActiveTournament, viewState } = useTournamentStore()
  const activeTournament = getActiveTournament()

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'var(--surface-bg)'
    }}>
      <nav style={{
        width: 220, minWidth: 220,
        background: 'var(--surface-01)',
        borderRight: '1px solid var(--surface-border)',
        display: 'flex', flexDirection: 'column',
        padding: 'var(--space-4) 0'
      }}>
        <div style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--surface-border)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: 'var(--gp-primary)', textTransform: 'uppercase',
            marginBottom: 4
          }}>
            GP Tournament
          </div>
          <div style={{
            fontSize: 13, color: 'var(--text-secondary)',
            fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {activeTournament?.name || 'Sin torneo activo'}
          </div>
        </div>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-5)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--surface-03)' : 'transparent',
              textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '3px solid var(--gp-primary)' : '3px solid transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div style={{
          marginTop: 'auto',
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--surface-border)'
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            PANTALLA GRADA
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
            color: viewState === 'match' ? 'var(--color-success)'
              : viewState === 'waiting' ? 'var(--text-muted)'
              : 'var(--color-warning)'
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'currentColor'
            }} />
            {viewState === 'waiting' ? 'En espera'
              : viewState === 'bracket' ? 'Bracket'
              : viewState === 'match' ? 'Combate activo'
              : 'Podio'}
          </div>
        </div>
      </nav>

      <main style={{
        flex: 1, overflow: 'auto',
        padding: 'var(--space-6)'
      }}>
        <Outlet />
      </main>
    </div>
  )
}
