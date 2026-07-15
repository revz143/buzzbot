import { useEffect, useRef, type JSX, type PointerEvent } from 'react'
import { useStore } from '../store/useStore'

export function DragPlate(): JSX.Element {
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.settings.activeMode)
  const setCollapsed = useStore((s) => s.setCollapsed)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const settingsOpen = useStore((s) => s.settingsOpen)
  const dragging = useRef(false)

  const modeTasks = tasks.filter((t) => t.mode === mode)
  const done = modeTasks.filter((t) => t.done).length

  useEffect(() => {
    const up = (): void => {
      if (dragging.current) {
        dragging.current = false
        window.buzzz.dragEnd()
      }
    }
    window.addEventListener('pointerup', up)
    window.addEventListener('blur', up)
    return () => {
      window.removeEventListener('pointerup', up)
      window.removeEventListener('blur', up)
    }
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    if ((e.target as HTMLElement).closest('button')) return
    dragging.current = true
    window.buzzz.dragStart()
  }

  return (
    <div
      className="clip-plate"
      onPointerDown={onPointerDown}
      onDoubleClick={() => setCollapsed(true)}
      style={{
        position: 'relative',
        background: 'var(--hive)',
        color: 'var(--ink)',
        padding: '11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'grab',
        touchAction: 'none',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 16, height: 2, background: 'var(--ink)' }} />
        ))}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 2, flex: 1 }}>
        BUZZZ — TODAY
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>
        {done}/{modeTasks.length}
      </div>
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        title="Settings"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--ink)',
          lineHeight: 1,
          padding: '2px 4px'
        }}
      >
        {settingsOpen ? '✕' : '⚙'}
      </button>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 40,
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
          animation: 'sheen 4s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
