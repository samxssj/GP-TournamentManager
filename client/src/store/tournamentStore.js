import { create } from 'zustand'

const useTournamentStore = create((set, get) => ({
  // Estado de /control
  tournaments: [],
  activeTournamentId: null,
  athletes: [],

  // Estado de /view (sincronizado vía socket)
  viewState: 'waiting',
  activeCategory: null,
  activeMatch: null,

  // Score en tiempo real (actualizado por socket tick y match:updated)
  matchResult: null,
  remainingSeconds: 0,

  // Setters simples
  setTournaments: (tournaments) => set({ tournaments }),
  setAthletes: (athletes) => set({ athletes }),
  setActiveTournamentId: (id) => set({ activeTournamentId: id }),

  // Obtener torneo activo
  getActiveTournament: () => {
    const { tournaments, activeTournamentId } = get()
    return tournaments.find(t => t.id === activeTournamentId) || null
  },

  // Actualizar torneo en la lista
  updateTournament: (tournament) => set(state => ({
    tournaments: state.tournaments.map(t => t.id === tournament.id ? tournament : t)
  })),

  // Handlers de eventos socket
  handleViewState: ({ viewState, tournament, activeCategory, activeMatch }) => {
    set({ viewState, activeCategory, activeMatch })
    if (tournament) {
      set(state => ({
        tournaments: state.tournaments.some(t => t.id === tournament.id)
          ? state.tournaments.map(t => t.id === tournament.id ? tournament : t)
          : [...state.tournaments, tournament]
      }))
    }
    if (activeMatch) set({ matchResult: activeMatch.result })
  },

  handleMatchUpdated: ({ match }) => {
    set({ matchResult: match.result, activeMatch: match })
    set(state => ({
      activeCategory: state.activeCategory
        ? {
            ...state.activeCategory,
            matches: state.activeCategory.matches.map(m => m.id === match.id ? match : m)
          }
        : state.activeCategory
    }))
  },

  handleMatchTick: ({ remaining }) => set({ remainingSeconds: remaining }),

  handleTournamentUpdated: ({ tournament }) => set(state => ({
    tournaments: state.tournaments.map(t => t.id === tournament.id ? tournament : t)
  }))
}))

export default useTournamentStore
