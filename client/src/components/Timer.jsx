import { useMemo } from 'react'

export default function Timer({ seconds, size = 'md' }) {
  const display = useMemo(() => {
    const s = Math.max(0, Math.floor(seconds))
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }, [seconds])

  const sizes = { sm: { fontSize: 24, padding: '4px 12px' }, md: { fontSize: 40, padding: '8px 20px' }, lg: { fontSize: 80, padding: '16px 32px' } }
  const isLow = seconds <= 30 && seconds > 0
  const isDone = seconds === 0

  return (
    <div style={{
      fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, letterSpacing: 4,
      color: isDone ? 'var(--color-danger)' : isLow ? 'var(--color-warning)' : 'var(--text-primary)',
      background: isDone ? 'rgba(239,68,68,0.1)' : isLow ? 'rgba(245,158,11,0.1)' : 'var(--surface-03)',
      border: `2px solid ${isDone ? 'var(--color-danger)' : isLow ? 'var(--color-warning)' : 'var(--surface-border)'}`,
      borderRadius: 'var(--radius-md)', transition: 'color 0.3s, border-color 0.3s, background 0.3s',
      userSelect: 'none', display: 'inline-block', ...sizes[size]
    }}>
      {display}
    </div>
  )
}
