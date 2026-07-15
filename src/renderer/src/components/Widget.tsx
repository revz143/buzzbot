import { useEffect, useRef, type JSX } from 'react'
import { useStore } from '../store/useStore'
import { DragPlate } from './DragPlate'
import { ModePlates } from './ModePlates'
import { TaskList } from './TaskList'
import { SnoozeBanner } from './SnoozeBanner'
import { Footer } from './Footer'
import { SettingsPanel } from '../settings/SettingsPanel'

export function Widget(): JSX.Element {
  const restingOpacity = useStore((s) => s.settings.restingOpacity)
  const nudge = useStore((s) => s.nudge)
  const settingsOpen = useStore((s) => s.settingsOpen)
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.settings.activeMode)
  const wrapRef = useRef<HTMLDivElement>(null)

  const modeTasks = tasks.filter((t) => t.mode === mode)
  const allDone = modeTasks.length > 0 && modeTasks.every((t) => t.done)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      window.buzzz.setContentHeight(el.offsetHeight)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        padding: 24,
        width: 336,
        opacity: nudge ? 1 : undefined,
        transition: 'opacity 0.25s ease'
      }}
      className="widget-opacity"
    >
      <style>{`
        .widget-opacity { opacity: ${nudge ? 1 : restingOpacity / 100}; }
        .widget-opacity:hover { opacity: 1; }
      `}</style>
      <div
        className="clip-panel"
        style={{
          width: 288,
          background: 'var(--ink)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(var(--glow),0.2)',
          animation: nudge
            ? 'nudgeFlash 1s ease-in-out 3'
            : allDone
              ? 'allDoneFlash 1.4s ease-in-out 3'
              : undefined
        }}
      >
        <DragPlate />
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ModePlates />
          {nudge && <SnoozeBanner />}
          {settingsOpen ? <SettingsPanel /> : <TaskList />}
        </div>
        <Footer allDone={allDone} />
        <div className={`hazard${allDone ? ' animate' : ''}`} />
      </div>
    </div>
  )
}
