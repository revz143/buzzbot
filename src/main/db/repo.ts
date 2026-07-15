import type { Mode, ModeSchedule, Settings, Task } from '@shared/types'
import { getDb } from './connection'

interface TaskRow {
  id: number
  mode: Mode
  label: string
  sort: number
  done: number
  done_at: string | null
  remind_at: string | null
  snoozed_until: string | null
  last_fired_on: string | null
  created_at: string
}

function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    mode: r.mode,
    label: r.label,
    sort: r.sort,
    done: !!r.done,
    doneAt: r.done_at,
    remindAt: r.remind_at,
    snoozedUntil: r.snoozed_until,
    createdAt: r.created_at
  }
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  restingOpacity: 85,
  theme: 'hive',
  activeMode: 'work',
  launchAtLogin: false,
  quietEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00',
  collapsed: false,
  hotkeyToggle: 'Alt+Space',
  hotkeyQuickAdd: 'Alt+N'
}

// ---------- settings ----------

export function getSetting<T>(key: string, fallback: T): T {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  if (!row) return fallback
  try {
    return JSON.parse(row.value) as T
  } catch {
    return fallback
  }
}

export function setSetting(key: string, value: unknown): void {
  getDb()
    .prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .run(key, JSON.stringify(value))
}

export function getSettings(): Settings {
  return {
    onboarded: getSetting('onboarded', DEFAULT_SETTINGS.onboarded),
    restingOpacity: getSetting('resting_opacity', DEFAULT_SETTINGS.restingOpacity),
    theme: getSetting('theme', DEFAULT_SETTINGS.theme),
    activeMode: getSetting('active_mode', DEFAULT_SETTINGS.activeMode),
    launchAtLogin: getSetting('launch_at_login', DEFAULT_SETTINGS.launchAtLogin),
    quietEnabled: getSetting('quiet_enabled', DEFAULT_SETTINGS.quietEnabled),
    quietStart: getSetting('quiet_start', DEFAULT_SETTINGS.quietStart),
    quietEnd: getSetting('quiet_end', DEFAULT_SETTINGS.quietEnd),
    collapsed: getSetting('collapsed', DEFAULT_SETTINGS.collapsed),
    hotkeyToggle: getSetting('hotkey_toggle', DEFAULT_SETTINGS.hotkeyToggle),
    hotkeyQuickAdd: getSetting('hotkey_quickadd', DEFAULT_SETTINGS.hotkeyQuickAdd)
  }
}

const SETTING_KEY_MAP: Record<keyof Settings, string> = {
  onboarded: 'onboarded',
  restingOpacity: 'resting_opacity',
  theme: 'theme',
  activeMode: 'active_mode',
  launchAtLogin: 'launch_at_login',
  quietEnabled: 'quiet_enabled',
  quietStart: 'quiet_start',
  quietEnd: 'quiet_end',
  collapsed: 'collapsed',
  hotkeyToggle: 'hotkey_toggle',
  hotkeyQuickAdd: 'hotkey_quickadd'
}

export function setSettingByApiKey(key: string, value: unknown): void {
  const dbKey = SETTING_KEY_MAP[key as keyof Settings] ?? key
  setSetting(dbKey, value)
}

// ---------- tasks ----------

export function getTasks(): Task[] {
  const rows = getDb()
    .prepare('SELECT * FROM tasks ORDER BY mode, sort, id')
    .all() as TaskRow[]
  return rows.map(rowToTask)
}

export function getTask(id: number): Task {
  const row = getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined
  if (!row) throw new Error(`task ${id} not found`)
  return rowToTask(row)
}

export function addTask(mode: Mode, label: string, remindAt: string | null = null): Task {
  const db = getDb()
  const next = db
    .prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS s FROM tasks WHERE mode = ?')
    .get(mode) as { s: number }
  const info = db
    .prepare('INSERT INTO tasks (mode, label, sort, remind_at) VALUES (?, ?, ?, ?)')
    .run(mode, label, next.s, remindAt)
  return getTask(Number(info.lastInsertRowid))
}

export function toggleTask(id: number): Task {
  getDb()
    .prepare(
      `UPDATE tasks SET
         done = CASE done WHEN 1 THEN 0 ELSE 1 END,
         done_at = CASE done WHEN 1 THEN NULL ELSE datetime('now','localtime') END,
         snoozed_until = NULL
       WHERE id = ?`
    )
    .run(id)
  return getTask(id)
}

export function deleteTask(id: number): void {
  getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

export function setTaskReminder(id: number, remindAt: string | null): Task {
  getDb()
    .prepare('UPDATE tasks SET remind_at = ?, last_fired_on = NULL, snoozed_until = NULL WHERE id = ?')
    .run(remindAt, id)
  return getTask(id)
}

export function snoozeTask(id: number, minutes: number): Task {
  const until = new Date(Date.now() + minutes * 60_000)
  getDb().prepare('UPDATE tasks SET snoozed_until = ? WHERE id = ?').run(toLocalIso(until), id)
  return getTask(id)
}

export function seedTasks(work: string[], personal: string[]): void {
  const db = getDb()
  const insert = db.prepare('INSERT INTO tasks (mode, label, sort) VALUES (?, ?, ?)')
  db.transaction(() => {
    work.forEach((label, i) => insert.run('work', label, i))
    personal.forEach((label, i) => insert.run('personal', label, i))
  })()
}

// ---------- schedules ----------

export function getSchedules(): ModeSchedule[] {
  const rows = getDb().prepare('SELECT * FROM mode_schedules').all() as Array<{
    mode: Mode
    enabled: number
    day_mask: number
    start_time: string
    end_time: string
  }>
  return rows.map((r) => ({
    mode: r.mode,
    enabled: !!r.enabled,
    dayMask: r.day_mask,
    startTime: r.start_time,
    endTime: r.end_time
  }))
}

export function setSchedule(s: ModeSchedule): void {
  getDb()
    .prepare(
      'UPDATE mode_schedules SET enabled = ?, day_mask = ?, start_time = ?, end_time = ? WHERE mode = ?'
    )
    .run(s.enabled ? 1 : 0, s.dayMask, s.startTime, s.endTime, s.mode)
}

// ---------- helpers ----------

export function toLocalIso(d: Date): string {
  const p = (n: number, len = 2): string => String(n).padStart(len, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export function todayStr(d = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function nowHHMM(d = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}
