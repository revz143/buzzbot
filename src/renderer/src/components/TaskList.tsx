import { useEffect, useRef, useState, type JSX, type KeyboardEvent } from 'react'
import { useStore } from '../store/useStore'
import { TaskRow } from './TaskRow'

export function TaskList(): JSX.Element {
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.settings.activeMode)
  const addTask = useStore((s) => s.addTask)
  const quickAddSignal = useStore((s) => s.quickAddSignal)

  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const firstSignal = useRef(true)

  const modeTasks = tasks.filter((t) => t.mode === mode)

  useEffect(() => {
    if (firstSignal.current) {
      firstSignal.current = false
      return
    }
    setAdding(true)
  }, [quickAddSignal])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const commit = (): void => {
    const trimmed = label.trim()
    if (trimmed) addTask(trimmed)
    setLabel('')
    setAdding(false)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setLabel('')
      setAdding(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {modeTasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
      {adding ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder="NEW CELL DESIGNATION…"
          style={{
            background: 'var(--panel)',
            border: '1px solid rgba(var(--glow),0.5)',
            borderLeft: '3px solid var(--hive)',
            color: 'var(--text)',
            fontSize: 11.5,
            padding: '8px 10px'
          }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: 'var(--text-mute)',
            textAlign: 'left',
            padding: '6px 10px',
            transition: 'color 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hive)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mute)')}
        >
          + NEW CELL…
        </button>
      )}
    </div>
  )
}
