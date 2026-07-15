# Buzzz 🐝

A futuristic floating desktop reminder widget for Windows. Always-on-top, frameless, and draggable — Buzzz keeps your daily tasks visible without getting in the way, guarded by Volt, your hornet field companion.

![Electron](https://img.shields.io/badge/Electron-38-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)

## Features

- **Floating widget** — frameless, always-on-top, transparent window that docks anywhere on screen with magnetic edge snapping
- **Work / Personal modes** — two separate task banks that never mix, each with its own optional day/time schedule
- **Reminders** — per-task time-of-day reminders with snooze; suppressed during quiet hours or when a mode is muted
- **Quiet hours** — silence all reminders on a nightly window
- **Streaks** — daily completion streaks tracked per mode
- **Collapse to badge** — double-click the drag plate to shrink into a compact hex badge; fades to resting opacity when idle
- **Color themes** — HIVE (hornet yellow) or BLOOM (pink/lavender), switchable in settings
- **Global hotkeys** — `Alt+Space` show/hide, `Alt+N` quick-add task
- **Onboarding wizard** — guided first-run setup with starter tasks
- **Launch at login** — optional autostart with Windows

## Tech Stack

| Layer | Tech |
|---|---|
| Shell | Electron 38 (electron-vite) |
| UI | React 19 + TypeScript |
| State | Zustand |
| Storage | better-sqlite3 (main process only) |
| Packaging | electron-builder (NSIS installer) |

## Architecture

```
src/
├── main/           # Electron main process
│   ├── db/         # SQLite connection, migrations, repository
│   ├── scheduler.ts# 30s tick reminder engine with catch-up semantics
│   ├── window.ts   # frameless window, drag, edge snapping
│   ├── tray.ts     # system tray
│   └── shortcuts.ts# global hotkeys
├── preload/        # typed `window.buzzz` bridge API
├── renderer/       # React UI (widget, settings, onboarding)
└── shared/         # types + IPC channel constants shared across processes
```

Key decisions:

- **DB lives in the main process only.** The renderer talks through a typed `window.buzzz` preload API; IPC channel names are centralized in `src/shared/ipc.ts`.
- **Dragging is cursor-polled from the main process** (not `-webkit-app-region: drag`) so double-click-to-collapse and edge snapping keep working.
- **Scheduler uses catch-up semantics** — a reminder whose time passed while the machine slept still fires once; quiet-hours/muted reminders are skipped for the day, not deferred.

## Getting Started

### Prerequisites

- Node.js 20+
- Windows (packaging targets NSIS; dev works anywhere Electron runs)

### Development

```bash
npm install        # also rebuilds better-sqlite3 for Electron's ABI
npm run dev        # start with hot reload
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run in development with watch mode |
| `npm run build` | Build main/preload/renderer bundles |
| `npm run typecheck` | Typecheck node + web tsconfigs |
| `npm run dist` | Build and package a Windows NSIS installer |

> **Note:** `better-sqlite3` is compiled against Electron's ABI. Standalone `node` scripts can't open the DB — run them through Electron instead:
> `ELECTRON_RUN_AS_NODE=1 ./node_modules/electron/dist/electron.exe script.cjs`

## Usage

- **Drag** the yellow plate to move the widget; it snaps to screen edges
- **Double-click** the plate to collapse into the hex badge; double-click the badge to expand
- **Click a cell's checkbox** to complete a task (with a satisfying spark)
- **Hover a task** to set a reminder time or delete it
- **⚙ settings** — themes, opacity, quiet hours, mode schedules, hotkeys

## License

Private project — all rights reserved.
