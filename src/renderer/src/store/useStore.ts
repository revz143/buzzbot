import { create } from 'zustand'
import type {
  BootstrapData,
  Mode,
  ModeSchedule,
  MutedState,
  ReminderFired,
  Settings,
  Streaks,
  Task
} from '@shared/types'

export type View = 'loading' | 'onboarding' | 'widget'

interface Nudge {
  taskId: number
  mode: Mode
  label: string
}

interface BuzzzState {
  view: View
  settings: Settings
  tasks: Task[]
  schedules: ModeSchedule[]
  streaks: Streaks
  muted: MutedState
  hotkeyToggleOk: boolean
  hotkeyQuickAddOk: boolean
  nudge: Nudge | null
  flashId: number | null
  quickAddSignal: number
  settingsOpen: boolean

  hydrate(data: BootstrapData): void
  setView(view: View): void
  setSettingsOpen(open: boolean): void
  setActiveMode(mode: Mode): Promise<void>
  addTask(label: string, remindAt?: string | null): Promise<void>
  toggleTask(id: number): Promise<void>
  deleteTask(id: number): Promise<void>
  setReminder(id: number, remindAt: string | null): Promise<void>
  snooze(minutes: number): Promise<void>
  dismissNudge(): void
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>
  setSchedule(s: ModeSchedule): Promise<void>
  setCollapsed(collapsed: boolean): Promise<void>
  applyReminder(r: ReminderFired): void
  applyDayReset(tasks: Task[], streaks: Streaks): void
  applyMuted(muted: MutedState): void
  signalQuickAdd(): void
}

const defaultSettings: Settings = {
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

export const useStore = create<BuzzzState>((set, get) => ({
  view: 'loading',
  settings: defaultSettings,
  tasks: [],
  schedules: [],
  streaks: { work: 0, personal: 0 },
  muted: { work: false, personal: false },
  hotkeyToggleOk: true,
  hotkeyQuickAddOk: true,
  nudge: null,
  flashId: null,
  quickAddSignal: 0,
  settingsOpen: false,

  hydrate: (data) =>
    set({
      settings: data.settings,
      tasks: data.tasks,
      schedules: data.schedules,
      streaks: data.streaks,
      muted: data.muted,
      hotkeyToggleOk: data.hotkeyToggleOk,
      hotkeyQuickAddOk: data.hotkeyQuickAddOk,
      view: data.settings.onboarded ? 'widget' : 'onboarding'
    }),

  setView: (view) => set({ view }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

  setActiveMode: async (mode) => {
    set((s) => ({ settings: { ...s.settings, activeMode: mode } }))
    await window.buzzz.setSetting('activeMode', mode)
  },

  addTask: async (label, remindAt = null) => {
    const mode = get().settings.activeMode
    const task = await window.buzzz.addTask(mode, label, remindAt)
    set((s) => ({ tasks: [...s.tasks, task] }))
  },

  toggleTask: async (id) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      flashId: id,
      nudge: s.nudge?.taskId === id ? null : s.nudge
    }))
    setTimeout(() => set((s) => (s.flashId === id ? { flashId: null } : s)), 700)
    const task = await window.buzzz.toggleTask(id)
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
  },

  deleteTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    await window.buzzz.deleteTask(id)
  },

  setReminder: async (id, remindAt) => {
    const task = await window.buzzz.setReminder(id, remindAt)
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
  },

  snooze: async (minutes) => {
    const nudge = get().nudge
    if (!nudge) return
    const task = await window.buzzz.snoozeTask(nudge.taskId, minutes)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === task.id ? task : t)),
      nudge: null
    }))
  },

  dismissNudge: () => set({ nudge: null }),

  setSetting: async (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }))
    if (key === 'launchAtLogin') {
      await window.buzzz.setLoginItem(value as boolean)
    } else {
      await window.buzzz.setSetting(key, value)
    }
  },

  setSchedule: async (schedule) => {
    set((s) => ({
      schedules: s.schedules.map((x) => (x.mode === schedule.mode ? schedule : x))
    }))
    await window.buzzz.setSchedule(schedule)
  },

  setCollapsed: async (collapsed) => {
    set((s) => ({ settings: { ...s.settings, collapsed } }))
    await window.buzzz.setCollapsed(collapsed)
  },

  applyReminder: (r) => set({ nudge: r }),
  applyDayReset: (tasks, streaks) => set({ tasks, streaks }),
  applyMuted: (muted) => set({ muted }),
  signalQuickAdd: () => set((s) => ({ quickAddSignal: s.quickAddSignal + 1, settingsOpen: false }))
}))
