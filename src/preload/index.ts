import { contextBridge, ipcRenderer } from 'electron'
import type {
  BuzzzApi,
  Mode,
  ModeSchedule,
  MutedState,
  OnboardingResult,
  ReminderFired,
  Streaks,
  Task
} from '@shared/types'
import { IPC } from '@shared/ipc'

const api: BuzzzApi = {
  bootstrap: () => ipcRenderer.invoke(IPC.bootstrap),
  addTask: (mode: Mode, label: string, remindAt: string | null = null) =>
    ipcRenderer.invoke(IPC.tasksAdd, mode, label, remindAt),
  toggleTask: (id: number) => ipcRenderer.invoke(IPC.tasksToggle, id),
  deleteTask: (id: number) => ipcRenderer.invoke(IPC.tasksDelete, id),
  setReminder: (id: number, remindAt: string | null) =>
    ipcRenderer.invoke(IPC.tasksSetReminder, id, remindAt),
  snoozeTask: (id: number, minutes: number) => ipcRenderer.invoke(IPC.tasksSnooze, id, minutes),
  setSetting: (key: string, value: unknown) => ipcRenderer.invoke(IPC.settingsSet, key, value),
  setSchedule: (schedule: ModeSchedule) => ipcRenderer.invoke(IPC.schedulesSet, schedule),
  completeOnboarding: (result: OnboardingResult) =>
    ipcRenderer.invoke(IPC.onboardingComplete, result),
  dragStart: () => ipcRenderer.send(IPC.windowDragStart),
  dragEnd: () => ipcRenderer.send(IPC.windowDragEnd),
  setCollapsed: (collapsed: boolean) => ipcRenderer.invoke(IPC.windowSetCollapsed, collapsed),
  setContentHeight: (height: number) => ipcRenderer.send(IPC.windowSetContentHeight, height),
  hideWindow: () => ipcRenderer.send(IPC.windowHide),
  quit: () => ipcRenderer.send(IPC.appQuit),
  setLoginItem: (enabled: boolean) => ipcRenderer.invoke(IPC.appSetLoginItem, enabled),
  onReminderFired: (cb: (r: ReminderFired) => void) =>
    ipcRenderer.on(IPC.pushReminderFired, (_e, r) => cb(r)),
  onDayReset: (cb: (data: { tasks: Task[]; streaks: Streaks }) => void) =>
    ipcRenderer.on(IPC.pushDayReset, (_e, d) => cb(d)),
  onMuteChanged: (cb: (muted: MutedState) => void) =>
    ipcRenderer.on(IPC.pushMuteChanged, (_e, m) => cb(m)),
  onFocusQuickAdd: (cb: () => void) => ipcRenderer.on(IPC.pushFocusQuickAdd, () => cb()),
  onShowOnboarding: (cb: () => void) => ipcRenderer.on(IPC.pushShowOnboarding, () => cb())
}

contextBridge.exposeInMainWorld('buzzz', api)
