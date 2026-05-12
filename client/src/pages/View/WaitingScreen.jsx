import { motion } from 'framer-motion'
import useTournamentStore from '../../store/tournamentStore.js'

/* URL del logo oficial de Grapplers Paradise — PNG sin fondo */
const GP_LOGO_URL = 'https://grapplersparadise.es/wp-content/uploads/2025/07/LOGO-SIN-FONDO.png'

export default function WaitingScreen() {
  const { tournaments, activeTournamentId } = useTournamentStore()
  const tournament = tournaments.find(t => t.id === activeTournamentId)

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      /* Fondo con tinte dorado muy sutil para alinearse con la identidad GP */
      background: 'radial-gradient(ellipse at center, #120e00 0%, #0a0a0a 70%)',
      gap: 40, overflow: 'hidden', position: 'relative'
    }}>
      {/* Partículas de ambiente con el dorado GP */}
      {[...Array(12)].map((_, i) => (
        <motion.div key={i} style={{
          position: 'absolute',
          width: 80 + (i * 17) % 80,
          height: 80 + (i * 13) % 80,
          borderRadius: '50%',
          background: i % 3 === 0
            ? `rgba(232,160,32,${0.02 + (i % 5) * 0.01})`   /* Dorado GP */
            : `rgba(45,139,58,${0.015 + (i % 4) * 0.008})`, /* Verde GP */
          left: `${(i * 23) % 100}%`,
          top: `${(i * 31) % 100}%`,
          filter: 'blur(40px)'
        }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Logo oficial GP — PNG sin fondo, filtro brightness para destacar sobre oscuro */}
        <motion.img
          src={GP_LOGO_URL}
          alt="Grapplers Paradise Jiu Jitsu Club"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: 90,
            width: 'auto',
            marginBottom: 32,
            /* El logo tiene fondo transparente pero texto oscuro;
               brightness eleva el texto para que sea visible sobre negro */
            filter: 'brightness(0) invert(1)',
            opacity: 0.92
          }}
        />

        <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -2, lineHeight: 1, textTransform: 'uppercase' }}>TOURNAMENT</div>

        {/* Línea de acento con el gradiente de marca GP */}
        <div style={{
          width: 120, height: 4,
          background: 'var(--gp-gradient)',
          borderRadius: 2,
          margin: '24px auto',
          boxShadow: '0 0 20px var(--gp-gradient-glow)'
        }} />

        {tournament && (
          <>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{tournament.name}</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{tournament.date} · {tournament.location}</div>
          </>
        )}
      </motion.div>

      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: 'var(--text-muted)', textTransform: 'uppercase', zIndex: 1 }}
      >
        ESPERANDO INICIO
      </motion.div>
    </div>
  )
}
