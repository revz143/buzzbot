import { app, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { IPC } from '@shared/ipc'
import { applyOnboardingBounds, getWindow, showWindow, toggleWindow } from './window'

let tray: Tray | null = null

export function createTray(): void {
  const iconPath = join(__dirname, '../../resources/tray.png')
  let icon = nativeImage.createFromPath(iconPath)
  if (icon.isEmpty()) {
    // fallback: solid hive-yellow 16x16
    icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKklEQVR4AWMY0eA/GsYmNlAGYDMEmxjpBuDSjE2cYgOoNRZoHwv0Cz2yAADeeUwl0z5AFAAAAABJRU5ErkJggg=='
    )
  }
  tray = new Tray(icon)
  tray.setToolTip('Buzzz — desktop reminders')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show / Hide', click: () => toggleWindow() },
      {
        label: 'Replay onboarding',
        click: () => {
          applyOnboardingBounds()
          showWindow()
          getWindow()?.webContents.send(IPC.pushShowOnboarding)
        }
      },
      { type: 'separator' },
      { label: 'Quit Buzzz', click: () => app.quit() }
    ])
  )
  tray.on('click', () => toggleWindow())
}
