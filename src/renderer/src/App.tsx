import { useEffect, type JSX } from 'react'
import { useStore } from './store/useStore'
import { OnboardingWizard } from './onboarding/OnboardingWizard'
import { Widget } from './components/Widget'
import { VoltBadge } from './components/VoltBadge'

export default function App(): JSX.Element | null {
  const view = useStore((s) => s.view)
  const collapsed = useStore((s) => s.settings.collapsed)
  const theme = useStore((s) => s.settings.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (view === 'loading') return null
  if (view === 'onboarding') return <OnboardingWizard />
  return collapsed ? <VoltBadge /> : <Widget />
}
