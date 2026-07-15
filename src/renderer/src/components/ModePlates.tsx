import type { JSX } from 'react'
import type { Mode } from '@shared/types'
import { useStore } from '../store/useStore'

export function ModePlates(): JSX.Element {
  const activeMode = useStore((s) => s.settings.activeMode)
  const setActiveMode = useStore((s) => s.setActiveMode)
  const muted = useStore((s) => s.muted)
  const streaks = useStore((s) => s.streaks)

  const plate = (mode: Mode, label: string): JSX.Element => {
    const active = activeMode === mode
    const isMuted = muted[mode]
    const streak = streaks[mode]
    return (
      <button
        key={mode}
        className="clip-slant"
        onClick={() => setActiveMode(mode)}
        style={{
          flex: 1,
          padding: '8px 0',
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          background: active ? 'var(--hive)' : 'var(--panel)',
          color: active ? 'var(--ink)' : 'var(--text-dim)',
          boxShadow: active ? '0 0 14px rgba(var(--glow),0.45)' : undefined,
          opacity: isMuted ? 0.55 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}
      >
        <span>{label}</span>
        {streak > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 600,
              color: active ? 'var(--ink)' : 'var(--hive)'
            }}
          >
            ⚡{streak}
          </span>
        )}
        {isMuted && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: 1,
              color: active ? 'var(--ink)' : 'var(--text-mute)'
            }}
          >
            MUTED
          </span>
        )}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {plate('work', 'WORK')}
      {plate('personal', 'PERSONAL')}
    </div>
  )
}
