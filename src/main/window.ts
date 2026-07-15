import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import { getSetting, setSetting } from './db/repo'

const WIDGET_WIDTH = 336 // 288 widget + 24px glow margin each side
const COLLAPSED_W = 264 // Volt mascot + task speech bubble
const COLLAPSED_H = 168
const ONBOARDING_W = 560
const ONBOARDING_H = 700
const SNAP_DISTANCE = 32
const SNAP_INSET = 12

let win: BrowserWindow | null = null
let dragTimer: NodeJS.Timeout | null = null
let contentHeight = 560

export function getWindow(): BrowserWindow | null {
  return win
}

export function createWindow(onboarded: boolean): BrowserWindow {
  win = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: contentHeight,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  win.setAlwaysOnTop(true, 'screen-saver')

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (onboarded) {
    applyWidgetBounds(getSetting('collapsed', false))
  } else {
    applyOnboardingBounds()
  }

  win.once('ready-to-show', () => win?.show())

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function workAreaFor(bounds: Electron.Rectangle): Electron.Rectangle {
  return screen.getDisplayMatching(bounds).workArea
}

function clampToWorkArea(x: number, y: number, w: number, h: number): [number, number] {
  const wa = workAreaFor({ x, y, width: w, height: h })
  const cx = Math.min(Math.max(x, wa.x - w + 60), wa.x + wa.width - 60)
  const cy = Math.min(Math.max(y, wa.y), wa.y + wa.height - 60)
  return [cx, cy]
}

export function applyOnboardingBounds(): void {
  if (!win) return
  const wa = screen.getPrimaryDisplay().workArea
  win.setBounds({
    x: wa.x + Math.round((wa.width - ONBOARDING_W) / 2),
    y: wa.y + Math.round((wa.height - ONBOARDING_H) / 2),
    width: ONBOARDING_W,
    height: ONBOARDING_H
  })
}

export function applyWidgetBounds(collapsed: boolean): void {
  if (!win) return
  const wa = screen.getPrimaryDisplay().workArea
  const w = collapsed ? COLLAPSED_W : WIDGET_WIDTH
  const h = collapsed ? COLLAPSED_H : contentHeight
  const defX = wa.x + wa.width - w - SNAP_INSET
  const defY = wa.y + 90
  const x = getSetting('window_x', defX)
  const y = getSetting('window_y', defY)
  const [cx, cy] = clampToWorkArea(x, y, w, h)
  win.setBounds({ x: cx, y: cy, width: w, height: h })
}

export function setCollapsed(collapsed: boolean): void {
  if (!win) return
  setSetting('collapsed', collapsed)
  const [x, y] = win.getPosition()
  const w = collapsed ? COLLAPSED_W : WIDGET_WIDTH
  const h = collapsed ? COLLAPSED_H : contentHeight
  const [cx, cy] = clampToWorkArea(x, y, w, h)
  win.setBounds({ x: cx, y: cy, width: w, height: h })
}

export function setContentHeight(height: number): void {
  if (!win) return
  const h = Math.max(160, Math.round(height))
  if (Math.abs(h - contentHeight) < 4) return
  contentHeight = h
  if (!getSetting('collapsed', false)) {
    const [x, y] = win.getPosition()
    win.setBounds({ x, y, width: WIDGET_WIDTH, height: h })
  }
}

export function startDrag(): void {
  if (!win || dragTimer) return
  const cursor = screen.getCursorScreenPoint()
  const [wx, wy] = win.getPosition()
  const offX = cursor.x - wx
  const offY = cursor.y - wy
  dragTimer = setInterval(() => {
    if (!win) return
    const p = screen.getCursorScreenPoint()
    win.setPosition(p.x - offX, p.y - offY, false)
  }, 12)
}

export function endDrag(): void {
  if (dragTimer) {
    clearInterval(dragTimer)
    dragTimer = null
  }
  if (!win) return
  const b = win.getBounds()
  const wa = workAreaFor(b)
  let { x, y } = b
  if (x - wa.x < SNAP_DISTANCE) x = wa.x + SNAP_INSET
  if (wa.x + wa.width - (x + b.width) < SNAP_DISTANCE) x = wa.x + wa.width - b.width - SNAP_INSET
  if (y - wa.y < SNAP_DISTANCE) y = wa.y + SNAP_INSET
  if (wa.y + wa.height - (y + b.height) < SNAP_DISTANCE)
    y = wa.y + wa.height - b.height - SNAP_INSET
  win.setPosition(x, y, true)
  setSetting('window_x', x)
  setSetting('window_y', y)
}

export function showWindow(): void {
  if (!win) return
  win.show()
  win.focus()
}

export function toggleWindow(): void {
  if (!win) return
  if (win.isVisible()) win.hide()
  else showWindow()
}
