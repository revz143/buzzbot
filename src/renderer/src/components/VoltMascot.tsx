import type { JSX } from 'react'

export type VoltMood = 'idle' | 'happy' | 'alert'

const YEL = 'var(--hive)'
const DK = 'var(--ink)'
const CYAN = 'var(--cyan)'

export function VoltMascot({ size, mood }: { size: number; mood: VoltMood }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="-2 -8 68 66" style={{ overflow: 'visible', display: 'block' }}>
      <path d="M20 16 L10 -4 L16 -2 L24 12 Z" fill={YEL} stroke={DK} strokeWidth={1.5} />
      <path d="M44 16 L54 -4 L48 -2 L40 12 Z" fill={YEL} stroke={DK} strokeWidth={1.5} />
      <path d="M14 14 L50 14 L54 26 L48 44 L40 52 L24 52 L16 44 L10 26 Z" fill={YEL} stroke={DK} strokeWidth={2} />
      <path d="M28 14 L32 22 L36 14 Z" fill={DK} />
      <path d="M17 26 L47 26 L44 38 L20 38 Z" fill={DK} />
      <path
        d="M26 44 L32 49 L38 44"
        stroke={DK}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {mood === 'happy' && (
        <>
          <path
            d="M23 33 Q26.5 28 30 33"
            stroke={CYAN}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px var(--cyan))' }}
          />
          <path
            d="M34 33 Q37.5 28 41 33"
            stroke={CYAN}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px var(--cyan))' }}
          />
          <path
            d="M6 20 L2 16 M58 20 L62 16"
            stroke={YEL}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ animation: 'neonPulse 1.2s infinite' }}
          />
        </>
      )}
      {mood === 'idle' && (
        <g style={{ animation: 'blink 5s infinite', transformOrigin: '32px 31px' }}>
          <rect x={23} y={29} width={7} height={4.5} rx={1} fill={CYAN} style={{ filter: 'drop-shadow(0 0 3px var(--cyan))' }} />
          <rect x={34} y={29} width={7} height={4.5} rx={1} fill={CYAN} style={{ filter: 'drop-shadow(0 0 3px var(--cyan))' }} />
        </g>
      )}
      {mood === 'alert' && (
        <>
          <g style={{ animation: 'neonPulse 0.5s infinite', transformOrigin: '32px 31px' }}>
            <rect x={23} y={28} width={7} height={6} rx={1} fill={CYAN} style={{ filter: 'drop-shadow(0 0 6px var(--cyan))' }} />
            <rect x={34} y={28} width={7} height={6} rx={1} fill={CYAN} style={{ filter: 'drop-shadow(0 0 6px var(--cyan))' }} />
          </g>
          <path
            d="M6 20 L2 16 M58 20 L62 16"
            stroke={YEL}
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ animation: 'neonPulse 0.4s infinite' }}
          />
        </>
      )}
    </svg>
  )
}
