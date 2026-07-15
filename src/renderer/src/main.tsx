import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import './styles/global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './store/useStore'

const store = useStore.getState

window.buzzz.onReminderFired((r) => store().applyReminder(r))
window.buzzz.onDayReset((d) => store().applyDayReset(d.tasks, d.streaks))
window.buzzz.onMuteChanged((m) => store().applyMuted(m))
window.buzzz.onFocusQuickAdd(() => store().signalQuickAdd())
window.buzzz.onShowOnboarding(() => store().setView('onboarding'))

window.buzzz.bootstrap().then((data) => store().hydrate(data))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
