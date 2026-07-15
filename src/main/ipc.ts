import { app, ipcMain } from 'electron'
import type { Mode, ModeSchedule, OnboardingResult } from '@shared/types'
import { IPC } from '@shared/ipc'
import * as repo from './db/repo'
import { currentMuted, getStreaks, tick } from './scheduler'
import { endDrag, getWindow, applyWidgetBounds, setCollapsed, setContentHeight, startDrag } from './window'
import type { ShortcutStatus } from './shortcuts'

export function registerIpc(shortcutStatus: ShortcutStatus): void {
  ipcMain.handle(IPC.bootstrap, () => ({
    settings: repo.getSettings(),
    tasks: repo.getTasks(),
    schedules: repo.getSchedules(),
    streaks: getStreaks(),
    muted: currentMuted(),
    hotkeyToggleOk: shortcutStatus.toggleOk,
    hotkeyQuickAddOk: shortcutStatus.quickAddOk
  }))

  ipcMain.handle(IPC.tasksAdd, (_e, mode: Mode, label: string, remindAt: string | null) =>
    repo.addTask(mode, label, remindAt)
  )
  ipcMain.handle(IPC.tasksToggle, (_e, id: number) => repo.toggleTask(id))
  ipcMain.handle(IPC.tasksDelete, (_e, id: number) => repo.deleteTask(id))
  ipcMain.handle(IPC.tasksSetReminder, (_e, id: number, remindAt: string | null) => {
    const t = repo.setTaskReminder(id, remindAt)
    tick()
    return t
  })
  ipcMain.handle(IPC.tasksSnooze, (_e, id: number, minutes: number) =>
    repo.snoozeTask(id, minutes)
  )

  ipcMain.handle(IPC.settingsSet, (_e, key: string, value: unknown) => {
    repo.setSettingByApiKey(key, value)
  })

  ipcMain.handle(IPC.schedulesSet, (_e, s: ModeSchedule) => {
    repo.setSchedule(s)
    tick()
  })

  ipcMain.handle(IPC.onboardingComplete, (_e, r: OnboardingResult) => {
    const existing = repo.getTasks()
    const have = new Set(existing.map((t) => `${t.mode}:${t.label.toLowerCase()}`))
    repo.seedTasks(
      r.work.filter((l) => !have.has(`work:${l.toLowerCase()}`)),
      r.personal.filter((l) => !have.has(`personal:${l.toLowerCase()}`))
    )
    repo.setSetting('resting_opacity', r.restingOpacity)
    repo.setSetting('onboarded', true)
    applyWidgetBounds(false)
    repo.setSetting('collapsed', false)
  })

  ipcMain.on(IPC.windowDragStart, () => startDrag())
  ipcMain.on(IPC.windowDragEnd, () => endDrag())
  ipcMain.handle(IPC.windowSetCollapsed, (_e, collapsed: boolean) => setCollapsed(collapsed))
  ipcMain.on(IPC.windowSetContentHeight, (_e, h: number) => setContentHeight(h))
  ipcMain.on(IPC.windowHide, () => getWindow()?.hide())
  ipcMain.on(IPC.appQuit, () => app.quit())

  ipcMain.handle(IPC.appSetLoginItem, (_e, enabled: boolean) => {
    app.setLoginItemSettings({ openAtLogin: enabled })
    repo.setSetting('launch_at_login', enabled)
  })
}
