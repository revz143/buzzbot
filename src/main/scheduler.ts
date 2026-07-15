import { Notification, nativeImage, powerMonitor } from 'electron'
import { join } from 'path'
import type { Mode, MutedState, Streaks } from '@shared/types'
import { IPC } from '@shared/ipc'
import { getDb } from './db/connection'
import {
  getSchedules,
  getSetting,
  getTasks,
  nowHHMM,
  setSetting,
  todayStr,
  toLocalIso
} from './db/repo'
import { getWindow, showWindow } from './window'

const TICK_MS = 30_000
let lastMuted: MutedState | null = null

function send(channel: string, payload?: unknown): void {
  getWindow()?.webContents.send(channel, payload)
}

// ---------- gates ----------

function inWindow(now: string, start: string, end: string): boolean {
  // wrap-aware: '22:00'–'07:00' spans midnight
  if (start <= end) return now >= start && now < end
  return now >= start || now < end
}

export function isQuietNow(d = new Date()): boolean {
  if (!getSetting('quiet_enabled', false)) return false
  return inWindow(nowHHMM(d), getSetting('quiet_start', '22:00'), getSetting('quiet_end', '07:00'))
}

export function isModeMuted(mode: Mode, d = new Date()): boolean {
  const s = getSchedules().find((x) => x.mode === mode)
  if (!s || !s.enabled) return false
  const dayBit = (d.getDay() + 6) % 7 // JS Sun=0 → bit0=Mon
  if (!(s.dayMask & (1 << dayBit))) return true
  return !inWindow(nowHHMM(d), s.startTime, s.endTime)
}

export function currentMuted(): MutedState {
  return { work: isModeMuted('work'), personal: isModeMuted('personal') }
}

// ---------- rollover + streaks ----------

export function getStreaks(): Streaks {
  return {
    work: getSetting('streak_work', 0),
    personal: getSetting('streak_personal', 0)
  }
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86_400_000)
}

export function rolloverIfNeeded(): boolean {
  const today = todayStr()
  const lastRun = getSetting<string | null>('last_run_date', null)
  if (lastRun === today) return false

  const db = getDb()
  db.transaction(() => {
    if (lastRun) {
      const gap = daysBetween(lastRun, today)
      for (const mode of ['work', 'personal'] as Mode[]) {
        const agg = db
          .prepare('SELECT COUNT(*) AS total, SUM(done) AS done FROM tasks WHERE mode = ?')
          .get(mode) as { total: number; done: number | null }
        const done = agg.done ?? 0
        const completed = agg.total > 0 && done === agg.total ? 1 : 0
        db.prepare(
          'INSERT OR REPLACE INTO day_history (date, mode, total, done, completed) VALUES (?, ?, ?, ?, ?)'
        ).run(lastRun, mode, agg.total, done, completed)
        const key = mode === 'work' ? 'streak_work' : 'streak_personal'
        const streak = gap > 1 ? 0 : completed ? getSetting(key, 0) + 1 : 0
        setSetting(key, streak)
      }
      db.prepare(
        'UPDATE tasks SET done = 0, done_at = NULL, snoozed_until = NULL, last_fired_on = NULL'
      ).run()
    }
    setSetting('last_run_date', today)
  })()

  if (lastRun) send(IPC.pushDayReset, { tasks: getTasks(), streaks: getStreaks() })
  return !!lastRun
}

// ---------- reminders ----------

interface DueRow {
  id: number
  mode: Mode
  label: string
}

// nativeImage reads from asar too, so one path works in dev and packaged
const toastIcon = nativeImage.createFromPath(join(__dirname, '../../resources/notify.png'))

function fireToast(mode: Mode, label: string): void {
  if (!Notification.isSupported()) return
  const n = new Notification({
    title: `BUZZZ // ${mode.toUpperCase()}`,
    body: label,
    icon: toastIcon
  })
  n.on('click', () => showWindow())
  n.show()
}

export function tick(): void {
  const now = new Date()
  rolloverIfNeeded()

  const today = todayStr(now)
  const hhmm = nowHHMM(now)
  const nowIso = toLocalIso(now)
  const db = getDb()

  const due = db
    .prepare(
      `SELECT id, mode, label FROM tasks
       WHERE done = 0 AND (
         (remind_at IS NOT NULL AND remind_at <= ? AND (last_fired_on IS NULL OR last_fired_on != ?))
         OR (snoozed_until IS NOT NULL AND snoozed_until <= ?)
       )`
    )
    .all(hhmm, today, nowIso) as DueRow[]

  const quiet = isQuietNow(now)
  const markFired = db.prepare(
    'UPDATE tasks SET last_fired_on = ?, snoozed_until = NULL WHERE id = ?'
  )

  for (const t of due) {
    // suppressed reminders are skipped for today, not deferred
    markFired.run(today, t.id)
    if (quiet || isModeMuted(t.mode, now)) continue
    fireToast(t.mode, t.label)
    send(IPC.pushReminderFired, { taskId: t.id, mode: t.mode, label: t.label })
  }

  const muted = currentMuted()
  if (!lastMuted || muted.work !== lastMuted.work || muted.personal !== lastMuted.personal) {
    lastMuted = muted
    send(IPC.pushMuteChanged, muted)
  }
}

export function startScheduler(): void {
  rolloverIfNeeded()
  lastMuted = currentMuted()
  setInterval(tick, TICK_MS)
  powerMonitor.on('resume', () => tick())
}
