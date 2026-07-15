import { useEffect, useRef, useState, type JSX, type PointerEvent } from 'react'
import { useStore } from '../store/useStore'
import { VoltMascot, type VoltMood } from './VoltMascot'

const CYCLE_MS = 3500
const CLICK_SLOP_PX = 4

export function VoltBadge(): JSX.Element {
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.settings.activeMode)
  const setCollapsed = useStore((s) => s.setCollapsed)
  const restingOpacity = useStore((s) => s.settings.restingOpacity)
  const nudge = useStore((s) => s.nudge)

  const modeTasks = tasks.filter((t) => t.mode === mode)
  const done = modeTasks.filter((t) => t.done).length
  const allDone = modeTasks.length > 0 && done === modeTasks.length

  const [idx, setIdx] = useState(0)
  const dragFrom = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (modeTasks.length === 0) return
    const timer = setInterval(() => setIdx((i) => i + 1), CYCLE_MS)
    return () => clearInterval(timer)
  }, [modeTasks.length])

  // drag anywhere on the badge; treat a no-move press as click-to-expand
  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    dragFrom.current = { x: e.screenX, y: e.screenY }
    window.buzzz.dragStart()
  }

  useEffect(() => {
    const up = (e: globalThis.PointerEvent): void => {
      if (!dragFrom.current) return
      const moved =
        Math.abs(e.screenX - dragFrom.current.x) > CLICK_SLOP_PX ||
        Math.abs(e.screenY - dragFrom.current.y) > CLICK_SLOP_PX
      dragFrom.current = null
      window.buzzz.dragEnd()
      if (!moved) void setCollapsed(false)
    }
    const cancel = (): void => {
      if (!dragFrom.current) return
      dragFrom.current = null
      window.buzzz.dragEnd()
    }
    window.addEventListener('pointerup', up)
    window.addEventListener('blur', cancel)
    return () => {
      window.removeEventListener('pointerup', up)
      window.removeEventListener('blur', cancel)
    }
  }, [setCollapsed])

  const task = modeTasks.length > 0 ? modeTasks[idx % modeTasks.length] : null
  const mood: VoltMood = nudge ? 'alert' : allDone ? 'happy' : 'idle'

  const bubbleText = nudge
    ? `⚡ ${nudge.label}`
    : task
      ? task.label
      : 'NO CELLS LOADED'
  const bubbleStatus = nudge
    ? 'REMINDER'
    : task
      ? task.done
        ? '▰ CHARGED'
        : '▱ PENDING'
    : ''

  return (
    <div
      onPointerDown={onPointerDown}
      title="Click to expand Buzzz — drag to move"
      style={{
        width: 264,
        height: 168,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '12px 10px',
        cursor: 'grab'
      }}
      className="badge-opacity"
    >
      <style>{`
        .badge-opacity { opacity: ${nudge ? 1 : restingOpacity / 100}; transition: opacity 0.25s ease; }
        .badge-opacity:hover { opacity: 1; }
        @keyframes bubbleIn { 0% { opacity: 0; transform: translateY(4px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* speech bubble */}
      <div
        key={nudge ? 'nudge' : (task?.id ?? 'empty')}
        className="clip-cell"
        style={{
          maxWidth: 240,
          background: 'var(--ink)',
          border: '1px solid rgba(var(--glow),0.55)',
          borderLeft: '3px solid var(--hive)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.55), 0 0 12px rgba(var(--glow),0.18)',
          padding: '7px 10px',
          marginBottom: 4,
          marginLeft: 6,
          animation: 'bubbleIn 0.3s ease-out'
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8.5,
            letterSpacing: 1.5,
            color: nudge ? 'var(--hive-bright)' : task?.done ? 'var(--hive)' : 'var(--text-dim)',
            marginBottom: 2
          }}
        >
          {bubbleStatus}
          {!nudge && modeTasks.length > 0 && (
            <span style={{ color: 'var(--text-mute)' }}>
              {' '}
              · {(idx % modeTasks.length) + 1}/{modeTasks.length}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: task?.done && !nudge ? 'var(--text-mute)' : 'var(--text)',
            textDecoration: task?.done && !nudge ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {bubbleText}
        </div>
      </div>

      {/* bubble tail */}
      <div
        style={{
          width: 0,
          height: 0,
          marginLeft: 26,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '7px solid rgba(var(--glow),0.55)'
        }}
      />

      {/* Volt + count chip */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 2 }}>
        <div style={{ animation: 'bob 3s ease-in-out infinite', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))' }}>
          <VoltMascot size={64} mood={mood} />
        </div>
        <div
          className="clip-hex"
          style={{
            width: 30,
            height: 26,
            background: 'var(--ink)',
            border: '1px solid var(--hive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--hive)',
            marginBottom: 8,
            boxShadow: '0 0 10px rgba(var(--glow),0.3)'
          }}
        >
          {done}/{modeTasks.length}
        </div>
      </div>
    </div>
  )
}
