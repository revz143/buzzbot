export const IPC = {
  bootstrap: 'app:bootstrap',
  tasksAdd: 'tasks:add',
  tasksToggle: 'tasks:toggle',
  tasksDelete: 'tasks:delete',
  tasksSetReminder: 'tasks:set-reminder',
  tasksSnooze: 'tasks:snooze',
  settingsSet: 'settings:set',
  schedulesSet: 'schedules:set',
  onboardingComplete: 'onboarding:complete',
  windowDragStart: 'window:drag-start',
  windowDragEnd: 'window:drag-end',
  windowSetCollapsed: 'window:set-collapsed',
  windowSetContentHeight: 'window:set-content-height',
  windowHide: 'window:hide',
  appQuit: 'app:quit',
  appSetLoginItem: 'app:set-login-item',
  // main → renderer pushes
  pushReminderFired: 'push:reminder-fired',
  pushDayReset: 'push:day-reset',
  pushMuteChanged: 'push:mute-changed',
  pushFocusQuickAdd: 'push:focus-quick-add',
  pushShowOnboarding: 'push:show-onboarding'
} as const
