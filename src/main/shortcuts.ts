import { globalShortcut } from 'electron'
import { IPC } from '@shared/ipc'
import { getSetting, setSetting } from './db/repo'
import { getWindow, showWindow, toggleWindow } from './window'

export interface ShortcutStatus {
  toggleOk: boolean
  quickAddOk: boolean
}

export function registerShortcuts(): ShortcutStatus {
  globalShortcut.unregisterAll()

  const toggleKey = getSetting('hotkey_toggle', 'Alt+Space')
  const quickAddKey = getSetting('hotkey_quickadd', 'Alt+N')

  let toggleOk = tryRegister(toggleKey, () => toggleWindow())
  if (!toggleOk && toggleKey === 'Alt+Space') {
    // Alt+Space is the native window system-menu key; fall back
    toggleOk = tryRegister('Ctrl+Alt+Space', () => toggleWindow())
    if (toggleOk) setSetting('hotkey_toggle', 'Ctrl+Alt+Space')
  }

  const quickAddOk = tryRegister(quickAddKey, () => {
    showWindow()
    getWindow()?.webContents.send(IPC.pushFocusQuickAdd)
  })

  return { toggleOk, quickAddOk }
}

function tryRegister(accelerator: string, cb: () => void): boolean {
  try {
    return globalShortcut.register(accelerator, cb)
  } catch {
    return false
  }
}
