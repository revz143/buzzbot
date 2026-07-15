import type { JSX } from 'react'
import { useStore } from '../store/useStore'
import { VoltMascot, type VoltMood } from './VoltMascot'

export function Footer({ allDone }: { allDone: boolean }): JSX.Element {
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.settings.activeMode)
  const nudge = useStore((s) => s.nudge)

  const modeTasks = tasks.filter((t) => t.mode === mode)
  const done = modeTasks.filter((t) => t.done).length
  const total = modeTasks.length
  const left = total - done
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  const mood: VoltMood = nudge ? 'alert' : allDone ? 'happy' : 'idle'

  const nudgeText = nudge
    ? `⚡ ${nudge.label.toUpperCase()} — TIME TO POWER UP.`
    : total === 0
      ? 'NO CELLS LOADED. ADD ONE.'
      : allDone
        ? '▰ ALL CELLS CHARGED. MISSION COMPLETE.'
        : left === 1
          ? '▰ ONE CELL LEFT — POWER UP.'
          : `POWER ${pct}% · ${left} CELLS LEFT`

  return (
    <div style={{ padding: '4px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ animation: 'bob 3s ease-in-out infinite' }}>
          <VoltMascot size={40} mood={mood} />
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 3, paddingBottom: 6 }}>
          {modeTasks.map((t) => (
            <div
              key={t.id}
              className="clip-cell"
              style={{
                flex: 1,
                height: 8,
                background: t.done ? 'var(--hive)' : 'var(--line)',
                boxShadow: t.done ? '0 0 6px rgba(var(--glow),0.5)' : undefined,
                transition: 'background 0.2s'
              }}
            />
          ))}
          {total === 0 && (
            <div className="clip-cell" style={{ flex: 1, height: 8, background: 'var(--line)' }} />
          )}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: 2,
          color: allDone || nudge ? 'var(--hive)' : 'var(--text-dim)'
        }}
      >
        {nudgeText}
      </div>
    </div>
  )
}
