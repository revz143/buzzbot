import type { JSX } from 'react'
import type { Mode, ModeSchedule, Theme } from '@shared/types'
import { useStore } from '../store/useStore'

const THEMES: Array<{ id: Theme; label: string; accent: string; ink: string }> = [
  { id: 'hive', label: 'HIVE', accent: '#f5b301', ink: '#1a1b1e' },
  { id: 'bloom', label: 'BLOOM', accent: '#ff7eb6', ink: '#241a22' }
]

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] // bit0=Mon … bit6=Sun

function SectionTitle({ children }: { children: string }): JSX.Element {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: 2,
        color: 'var(--hive)',
        marginTop: 4
      }}
    >
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: JSX.Element }): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--text-body)' }}>{label}</span>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <button
      className="clip-slant"
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 18,
        background: on ? 'var(--hive)' : 'var(--line)',
        color: on ? 'var(--ink)' : 'var(--text-mute)',
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        fontWeight: 600,
        letterSpacing: 1
      }}
    >
      {on ? 'ON' : 'OFF'}
    </button>
  )
}

function TimeInput({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      style={{
        background: 'var(--ink)',
        border: '1px solid var(--line)',
        color: 'var(--text)',
        fontSize: 10,
        padding: '2px 4px',
        colorScheme: 'dark'
      }}
    />
  )
}

function ScheduleEditor({ mode }: { mode: Mode }): JSX.Element | null {
  const schedules = useStore((s) => s.schedules)
  const setSchedule = useStore((s) => s.setSchedule)
  const schedule = schedules.find((x) => x.mode === mode)
  if (!schedule) return null

  const update = (patch: Partial<ModeSchedule>): void => {
    setSchedule({ ...schedule, ...patch })
  }

  return (
    <div
      style={{
        background: 'var(--panel-done)',
        borderLeft: '3px solid var(--edge-off)',
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}
    >
      <Row label={`${mode.toUpperCase()} schedule`}>
        <Toggle on={schedule.enabled} onChange={(v) => update({ enabled: v })} />
      </Row>
      {schedule.enabled && (
        <>
          <div style={{ display: 'flex', gap: 4 }}>
            {DAYS.map((d, i) => {
              const on = !!(schedule.dayMask & (1 << i))
              return (
                <button
                  key={i}
                  onClick={() => update({ dayMask: schedule.dayMask ^ (1 << i) })}
                  style={{
                    width: 20,
                    height: 20,
                    fontSize: 9,
                    fontWeight: 700,
                    background: on ? 'var(--hive)' : 'var(--line)',
                    color: on ? 'var(--ink)' : 'var(--text-mute)'
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <TimeInput value={schedule.startTime} onChange={(v) => update({ startTime: v })} />
            <span style={{ color: 'var(--text-mute)', fontSize: 10 }}>—</span>
            <TimeInput value={schedule.endTime} onChange={(v) => update({ endTime: v })} />
          </div>
        </>
      )}
    </div>
  )
}

export function SettingsPanel(): JSX.Element {
  const settings = useStore((s) => s.settings)
  const setSetting = useStore((s) => s.setSetting)
  const hotkeyToggleOk = useStore((s) => s.hotkeyToggleOk)
  const hotkeyQuickAddOk = useStore((s) => s.hotkeyQuickAddOk)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
      <SectionTitle>DISPLAY</SectionTitle>
      <Row label="Color theme">
        <div style={{ display: 'flex', gap: 4 }}>
          {THEMES.map((t) => {
            const on = settings.theme === t.id
            return (
              <button
                key={t.id}
                className="clip-slant"
                onClick={() => setSetting('theme', t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  background: on ? t.accent : 'var(--line)',
                  color: on ? t.ink : 'var(--text-mute)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: 1
                }}
              >
                <span
                  className="clip-hex"
                  style={{
                    width: 8,
                    height: 8,
                    background: on ? t.ink : t.accent,
                    display: 'inline-block'
                  }}
                />
                {t.label}
              </button>
            )
          })}
        </div>
      </Row>
      <Row label={`Resting opacity · ${settings.restingOpacity}%`}>
        <input
          type="range"
          min={40}
          max={100}
          step={5}
          value={settings.restingOpacity}
          onChange={(e) => setSetting('restingOpacity', Number(e.target.value))}
          style={{ width: 110, accentColor: 'var(--hive)' }}
        />
      </Row>

      <SectionTitle>SYSTEM</SectionTitle>
      <Row label="Launch at login">
        <Toggle
          on={settings.launchAtLogin}
          onChange={(v) => setSetting('launchAtLogin', v)}
        />
      </Row>

      <SectionTitle>QUIET HOURS</SectionTitle>
      <Row label="Silence all reminders">
        <Toggle on={settings.quietEnabled} onChange={(v) => setSetting('quietEnabled', v)} />
      </Row>
      {settings.quietEnabled && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <TimeInput value={settings.quietStart} onChange={(v) => setSetting('quietStart', v)} />
          <span style={{ color: 'var(--text-mute)', fontSize: 10 }}>—</span>
          <TimeInput value={settings.quietEnd} onChange={(v) => setSetting('quietEnd', v)} />
        </div>
      )}

      <SectionTitle>MODE SCHEDULES</SectionTitle>
      <ScheduleEditor mode="work" />
      <ScheduleEditor mode="personal" />

      <SectionTitle>HOTKEYS</SectionTitle>
      <Row label="Show / hide">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: hotkeyToggleOk ? 'var(--text)' : 'var(--text-mute)' }}>
          {settings.hotkeyToggle}
          {!hotkeyToggleOk && ' (unavailable)'}
        </span>
      </Row>
      <Row label="Quick add">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: hotkeyQuickAddOk ? 'var(--text)' : 'var(--text-mute)' }}>
          {settings.hotkeyQuickAdd}
          {!hotkeyQuickAddOk && ' (unavailable)'}
        </span>
      </Row>

      <button
        onClick={() => window.buzzz.quit()}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 2,
          color: 'var(--text-mute)',
          padding: '6px 0',
          marginTop: 4
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hive-bright)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mute)')}
      >
        ⏻ SHUT DOWN UNIT
      </button>
    </div>
  )
}
