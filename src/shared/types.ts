export type Mode = 'work' | 'personal'

export type Theme = 'hive' | 'bloom'

export interface Task {
  id: number
  mode: Mode
  label: string
  sort: number
  done: boolean
  doneAt: string | null
  remindAt: string | null // 'HH:MM' local time-of-day
  snoozedUntil: string | null // ISO datetime
  createdAt: string
}

export interface ModeSchedule {
  mode: Mode
  enabled: boolean
  dayMask: number // bit0=Mon … bit6=Sun
  startTime: string // 'HH:MM'
  endTime: string // 'HH:MM'
}

export interface Settings {
  onboarded: boolean
  restingOpacity: number // 40–100
  theme: Theme
  activeMode: Mode
  launchAtLogin: boolean
  quietEnabled: boolean
  quietStart: string // 'HH:MM'
  quietEnd: string // 'HH:MM'
  collapsed: boolean
  hotkeyToggle: string
  hotkeyQuickAdd: string
}

export interface Streaks {
  work: number
  personal: number
}

export interface MutedState {
  work: boolean
  personal: boolean
}

export interface BootstrapData {
  settings: Settings
  tasks: Task[]
  schedules: ModeSchedule[]
  streaks: Streaks
  muted: MutedState
  hotkeyToggleOk: boolean
  hotkeyQuickAddOk: boolean
}

export interface ReminderFired {
  taskId: number
  mode: Mode
  label: string
}

export interface OnboardingResult {
  work: string[]
  personal: string[]
  restingOpacity: number
}

export interface BuzzzApi {
  bootstrap(): Promise<BootstrapData>
  addTask(mode: Mode, label: string, remindAt?: string | null): Promise<Task>
  toggleTask(id: number): Promise<Task>
  deleteTask(id: number): Promise<void>
  setReminder(id: number, remindAt: string | null): Promise<Task>
  snoozeTask(id: number, minutes: number): Promise<Task>
  setSetting(key: string, value: unknown): Promise<void>
  setSchedule(schedule: ModeSchedule): Promise<void>
  completeOnboarding(result: OnboardingResult): Promise<void>
  dragStart(): void
  dragEnd(): void
  setCollapsed(collapsed: boolean): Promise<void>
  setContentHeight(height: number): void
  hideWindow(): void
  quit(): void
  setLoginItem(enabled: boolean): Promise<void>
  onReminderFired(cb: (r: ReminderFired) => void): void
  onDayReset(cb: (data: { tasks: Task[]; streaks: Streaks }) => void): void
  onMuteChanged(cb: (muted: MutedState) => void): void
  onFocusQuickAdd(cb: () => void): void
  onShowOnboarding(cb: () => void): void
}
