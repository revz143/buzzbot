import type { JSX } from 'react'
import { useStore } from '../store/useStore'

export function SnoozeBanner(): JSX.Element | null {
  const nudge = useStore((s) => s.nudge)
  const snooze = useStore((s) => s.snooze)
  const dismissNudge = useStore((s) => s.dismissNudge)

  if (!nudge) return null

  const chip = (label: string, minutes: number): JSX.Element => (
    <button
      key={minutes}
      className="clip-slant"
      onClick={() => snooze(minutes)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: 1,
        padding: '4px 10px',
        background: 'var(--panel)',
        color: 'var(--hive)',
        border: '1px solid rgba(var(--glow),0.4)'
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      className="clip-cell"
      style={{
        background: 'rgba(var(--glow),0.12)',
        border: '1px solid rgba(var(--glow),0.5)',
        borderLeft: '3px solid var(--hive)',
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        animation: 'cellFlash 1.2s ease-out'
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 1,
          color: 'var(--hive-bright)'
        }}
      >
        ⚡ REMINDER // {nudge.label}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {chip('5M', 5)}
        {chip('15M', 15)}
        {chip('60M', 60)}
        <button
          onClick={dismissNudge}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            color: 'var(--text-mute)',
            marginLeft: 'auto',
            letterSpacing: 1
          }}
        >
          DISMISS
        </button>
      </div>
    </div>
  )
}
