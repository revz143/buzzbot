import { useState, type JSX, type KeyboardEvent } from 'react'

interface Props {
  labels: string[]
  suggested: string[]
  onChange(labels: string[]): void
}

export function StarterTaskPicker({ labels, suggested, onChange }: Props): JSX.Element {
  const [draft, setDraft] = useState('')

  const toggle = (label: string): void => {
    onChange(labels.includes(label) ? labels.filter((l) => l !== label) : [...labels, label])
  }

  const addDraft = (): void => {
    const trimmed = draft.trim()
    if (trimmed && !labels.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...labels, trimmed])
    }
    setDraft('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') addDraft()
  }

  const custom = labels.filter((l) => !suggested.includes(l))
  const all = [...suggested, ...custom]

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {all.map((label) => {
          const on = labels.includes(label)
          return (
            <button
              key={label}
              className="clip-slant"
              onClick={() => toggle(label)}
              style={{
                padding: '7px 12px',
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: 0.5,
                background: on ? 'var(--hive)' : 'var(--panel)',
                color: on ? 'var(--ink)' : 'var(--text-mute)',
                boxShadow: on ? '0 0 10px rgba(var(--glow),0.35)' : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>{on ? '▰' : '▱'}</span>
              {label}
            </button>
          )
        })}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={addDraft}
        placeholder="NEW CELL DESIGNATION…"
        style={{
          background: 'var(--panel)',
          border: '1px solid rgba(var(--glow),0.5)',
          borderLeft: '3px solid var(--hive)',
          color: 'var(--text)',
          fontSize: 11.5,
          padding: '8px 10px',
          width: '100%'
        }}
      />
    </div>
  )
}
