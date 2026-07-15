import { useState, type JSX } from 'react'
import { useStore } from '../store/useStore'
import { VoltMascot } from '../components/VoltMascot'
import { StarterTaskPicker } from './StarterTaskPicker'

export const SUGGESTED_WORK = ['Check emails', 'Review PRs', 'Plan daily schedule', 'Standup notes']
export const SUGGESTED_PERSONAL = ['Morning stretch', 'Water the plants', 'Call mom', 'Read 20 pages']

const STEPS = [
  { header: 'BOOT SEQUENCE', title: 'UNIT VOLT ONLINE.' },
  { header: 'WORK CELLS', title: 'LOAD MISSION TASKS.' },
  { header: 'PERSONAL CELLS', title: 'LOAD OFF-DUTY TASKS.' },
  { header: 'DOCKING PROTOCOL', title: 'DEPLOY ANYWHERE.' }
]

export function OnboardingWizard(): JSX.Element {
  const setView = useStore((s) => s.setView)
  const setSetting = useStore((s) => s.setSetting)
  const [step, setStep] = useState(0)
  const [work, setWork] = useState<string[]>(SUGGESTED_WORK)
  const [personal, setPersonal] = useState<string[]>(SUGGESTED_PERSONAL)
  const [opacity, setOpacity] = useState(85)

  const deploy = async (w: string[], p: string[], o: number): Promise<void> => {
    await window.buzzz.completeOnboarding({ work: w, personal: p, restingOpacity: o })
    const data = await window.buzzz.bootstrap()
    useStore.getState().hydrate(data)
    setSetting('restingOpacity', o)
    setView('widget')
  }

  const skip = (): void => {
    void deploy(SUGGESTED_WORK, SUGGESTED_PERSONAL, 85)
  }

  const next = (): void => {
    if (step < 3) setStep(step + 1)
    else void deploy(work, personal, opacity)
  }

  return (
    <div
      style={{
        width: 560,
        height: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="clip-panel-lg"
        style={{
          width: 470,
          background: 'var(--ink)',
          boxShadow:
            '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(var(--glow),0.25), 0 0 60px rgba(var(--glow),0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* header plate */}
        <div
          className="clip-plate"
          style={{
            background: 'var(--hive)',
            color: 'var(--ink)',
            padding: '12px 18px',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          BUZZZ // {STEPS[step].header}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 50,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              animation: 'sheen 4s ease-in-out infinite',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* stage */}
        <div
          style={{
            minHeight: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px 22px 0'
          }}
        >
          {step === 0 && (
            <div style={{ animation: 'bob 3s ease-in-out infinite' }}>
              <VoltMascot size={96} mood="happy" />
            </div>
          )}
          {step === 1 && <StarterTaskPicker labels={work} suggested={SUGGESTED_WORK} onChange={setWork} />}
          {step === 2 && (
            <StarterTaskPicker labels={personal} suggested={SUGGESTED_PERSONAL} onChange={setPersonal} />
          )}
          {step === 3 && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <VoltMascot size={72} mood="idle" />
              <div style={{ width: '80%' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'var(--text-dim)',
                    marginBottom: 8
                  }}
                >
                  RESTING OPACITY · {opacity}%
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={5}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--hive)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* copy */}
        <div style={{ minHeight: 96, padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1.5, color: 'var(--text)', marginBottom: 8 }}>
            {STEPS[step].title}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-body)' }}>
            {step === 0 &&
              'Welcome to BUZZZ — your desktop reminder module. I am Volt, your field companion. I keep your daily objectives charged and visible without getting in the way.'}
            {step === 1 &&
              'Every reminder is a power cell. These are my suggested WORK cells — tap to drop any, add your own below. You can set a reminder time on each cell later.'}
            {step === 2 &&
              'Now the PERSONAL bank. Off-duty objectives never mix with mission tasks — each mode keeps its own cells and its own schedule.'}
            {step === 3 &&
              'Drag my yellow plate to reposition — the unit snaps magnetically to screen edges. Double-click the plate to collapse into a hex badge; I fade to rest opacity until you hover.'}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 22px 18px', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                className="clip-hex"
                onClick={() => setStep(i)}
                style={{
                  width: 14,
                  height: 10,
                  background: i === step ? 'var(--hive)' : i < step ? 'var(--hive-dim)' : 'var(--line)',
                  boxShadow: i === step ? '0 0 8px rgba(var(--glow),0.6)' : undefined
                }}
              />
            ))}
          </div>
          <button
            onClick={skip}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 2,
              color: 'var(--text-mute)',
              padding: '8px 10px'
            }}
          >
            SKIP
          </button>
          <button
            className="clip-slant"
            onClick={next}
            style={{
              background: 'var(--hive)',
              color: 'var(--ink)',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 2,
              padding: '10px 22px',
              boxShadow: '0 0 16px rgba(var(--glow),0.35)'
            }}
          >
            {step < 3 ? 'NEXT ▸' : 'DEPLOY UNIT'}
          </button>
        </div>
        <div className="hazard" />
      </div>
    </div>
  )
}
