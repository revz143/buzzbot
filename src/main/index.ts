import { app, BrowserWindow } from 'electron'
import { closeDb } from './db/connection'
import { getSetting } from './db/repo'
import { registerIpc } from './ipc'
import { startScheduler } from './scheduler'
import { registerShortcuts } from './shortcuts'
import { createTray } from './tray'
import { createWindow, showWindow } from './window'

app.setAppUserModelId('com.buzzz.app')

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => showWindow())

  app.whenReady().then(() => {
    const onboarded = getSetting('onboarded', false)
    createWindow(onboarded)
    createTray()
    const shortcutStatus = registerShortcuts()
    registerIpc(shortcutStatus)
    startScheduler()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(getSetting('onboarded', false))
      }
    })
  })

  // widget lives in tray; closing the window should not quit
  app.on('window-all-closed', () => {
    /* keep running in tray */
  })

  app.on('will-quit', () => closeDb())
}
