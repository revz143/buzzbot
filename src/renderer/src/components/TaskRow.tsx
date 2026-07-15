import { useRef, useState, type JSX, type MouseEvent } from 'react'
import type { Task } from '@shared/types'
import { useStore } from '../store/useStore'

const SPARKS = [
  { dx: '-14px', dy: '-16px' },
  { dx: '12px', dy: '-20px' },
  { dx: '18px', dy: '-6px' },
  { dx: '-18px', dy: '4px' },
  { dx: '8px', dy: '14px' }
]

export function TaskRow({ task }: { task: Task }): JSX.Element {
  const toggleTask = useStore((s) => s.toggleTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const setReminder = useStore((s) => s.setReminder)
  const flashId = useStore((s) => s.flashId)

  const [hover, setHover] = useState(false)
  const [editingTime, setEditingTime] = useState(false)
  const timeRef = useRef<HTMLInputElement>(null)

  const flashing = flashId === task.id

  const onRowClick = (): void => {
    if (!editingTime) toggleTask(task.id)
  }

  const stop = (e: MouseEvent): void => e.stopPropagation()

  return (
    <div
      onClick={onRowClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        fontSize: 12.5,
        cursor: 'pointer',
        background: hover && !task.done ? 'var(--panel-hover)' : task.done ? 'var(--panel-done)' : 'var(--panel)',
        borderLeft: `3px solid ${task.done ? 'var(--hive)' : 'var(--edge-off)'}`,
        color: task.done ? 'var(--text-mute)' : 'var(--text)',
        textDecoration: task.done ? 'line-through' : 'none',
        animation: flashing ? 'cellFlash 0.7s ease-out' : undefined,
        minHeight: 36
      }}
    >
      <span style={{ color: task.done ? 'var(--hive)' : 'var(--edge-off)', fontSize: 13 }}>
        {task.done ? '▰' : '▱'}
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {task.label}
      </span>

      {editingTime ? (
        <input
          ref={timeRef}
          type="time"
          autoFocus
          defaultValue={task.remindAt ?? ''}
          onClick={stop}
          onBlur={(e) => {
            setReminder(task.id, e.target.value || null)
            setEditingTime(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') setEditingTime(false)
          }}
          style={{
            background: 'var(--ink)',
            border: '1px solid rgba(var(--glow),0.5)',
            color: 'var(--text)',
            fontSize: 10,
            padding: '2px 4px',
            colorScheme: 'dark'
          }}
        />
      ) : task.remindAt ? (
        <button
          onClick={(e) => {
            stop(e)
            setEditingTime(true)
          }}
          title="Edit reminder time"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            fontWeight: 600,
            color: task.done ? 'var(--text-mute)' : 'var(--hive)',
            letterSpacing: 1
          }}
        >
          ⏰{task.remindAt}
        </button>
      ) : hover ? (
        <button
          onClick={(e) => {
            stop(e)
            setEditingTime(true)
          }}
          title="Set reminder time"
          style={{ fontSize: 11, color: 'var(--text-mute)' }}
        >
          ⏰
        </button>
      ) : null}

      {hover && (
        <button
          onClick={(e) => {
            stop(e)
            deleteTask(task.id)
          }}
          title="Delete"
          style={{ fontSize: 11, color: 'var(--text-mute)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hive-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mute)')}
        >
          ✕
        </button>
      )}

      {flashing &&
        SPARKS.map((s, i) => (
          <span
            key={i}
            style={
              {
                position: 'absolute',
                left: 12,
                top: '50%',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--hive-bright)',
                pointerEvents: 'none',
                animation: `sparkFly ${0.45 + i * 0.03}s ease-out forwards`,
                '--dx': s.dx,
                '--dy': s.dy
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  )
}
