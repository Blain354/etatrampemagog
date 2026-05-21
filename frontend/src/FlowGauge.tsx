import { useMemo } from 'react'

const THRESHOLD = 70
const MAX_FLOW = 150
const GAUGE_WIDTH = 600
const GAUGE_HEIGHT = 180
const PADDING_X = 60
const PADDING_Y = 30

interface FlowGaugeProps {
  riverFlow: string | null // e.g. "85 m3/s" or null if unavailable
}

function parseFlow(flow: string): number {
  const match = flow.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export default function FlowGauge({ riverFlow }: FlowGaugeProps) {
  const flow = riverFlow ? parseFlow(riverFlow) : null
  const hasData = flow !== null && flow > 0
  const isDanger = hasData && flow! > THRESHOLD
  const clampedFlow = hasData ? Math.min(flow!, MAX_FLOW) : 0

  // Map flow to water height (0 to 100% of water area)
  const waterAreaWidth = GAUGE_WIDTH - PADDING_X * 2
  const waterRatio = clampedFlow / MAX_FLOW
  const waterWidth = waterRatio * waterAreaWidth

  // Color interpolation: blue(0) -> green(30) -> yellow(55) -> orange(65) -> red(70+)
  const flowColor = useMemo(() => {
    if (waterRatio >= 0.47) return '#ef4444' // >70 = red
    if (waterRatio >= 0.43) return '#f97316' // 65-70 = orange
    if (waterRatio >= 0.37) return '#eab308' // 55-65 = yellow
    if (waterRatio >= 0.2) return '#22c55e'  // 30-55 = green
    return '#3b82f6'                          // 0-30 = blue
  }, [waterRatio])

  const thresholdX = PADDING_X + (THRESHOLD / MAX_FLOW) * waterAreaWidth

  const tickMarks = [0, 20, 40, 70, 100, 130, 150]

  return (
    <div className="flow-gauge" role="img" aria-label={hasData ? `Débit actuel : ${riverFlow}. Seuil de fermeture : ${THRESHOLD} m³/s` : `Seuil de fermeture : ${THRESHOLD} m³/s. Données de débit non disponibles.`}>
      <div className="flow-gauge-value">
        {hasData ? (
          <>
            <span className="flow-number">{flow}</span>
            <span className="flow-unit">m³/s</span>
          </>
        ) : (
          <span className="flow-no-data">Données de débit non disponibles</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
        className="flow-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="47%" stopColor="#eab308" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#ef4444" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="waterGradFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
            <stop offset="25%" stopColor="#22c55e" stopOpacity="0.55" />
            <stop offset="47%" stopColor="#eab308" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#f97316" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#ef4444" stopOpacity="0.55" />
          </linearGradient>
          <clipPath id="waterClip">
            <rect
              x={PADDING_X}
              y={PADDING_Y}
              width={waterWidth}
              height={GAUGE_HEIGHT - PADDING_Y * 2}
              rx={12}
            />
          </clipPath>
          {/* Wave pattern */}
          <pattern id="wavePattern" x="0" y="0" width="60" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M0,10 Q15,0 30,10 Q45,20 60,10"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>

        {/* Background bar */}
        <rect
          x={PADDING_X}
          y={PADDING_Y + 30}
          width={waterAreaWidth}
          height={GAUGE_HEIGHT - PADDING_Y * 2 - 30}
          rx={14}
          fill="var(--color-surface-2)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />

        {/* Filled water area with gradient */}
        {hasData && waterWidth > 0 && (
          <>
            <rect
              x={PADDING_X}
              y={PADDING_Y + 30}
              width={waterWidth}
              height={GAUGE_HEIGHT - PADDING_Y * 2 - 30}
              rx={14}
              fill="url(#waterGradFill)"
            />
            {/* Wave effect inside filled area */}
            <rect
              x={PADDING_X}
              y={PADDING_Y + 30}
              width={waterWidth}
              height={GAUGE_HEIGHT - PADDING_Y * 2 - 30}
              rx={14}
              fill="url(#wavePattern)"
              className="wave-move"
            />
          </>
        )}

        {/* Threshold line */}
        <line
          x1={thresholdX}
          y1={PADDING_Y + 20}
          x2={thresholdX}
          y2={GAUGE_HEIGHT - PADDING_Y + 10}
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeDasharray="6,4"
        />
        {/* Threshold flag */}
        <rect
          x={thresholdX - 28}
          y={PADDING_Y + 8}
          width={56}
          height={22}
          rx={6}
          fill="#ef4444"
        />
        <text
          x={thresholdX}
          y={PADDING_Y + 23}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          {THRESHOLD} SEUIL
        </text>

        {/* Current value indicator dot */}
        {hasData && waterWidth > 2 && (
          <circle
            cx={PADDING_X + waterWidth}
            cy={PADDING_Y + 30 + (GAUGE_HEIGHT - PADDING_Y * 2 - 30) / 2}
            r={7}
            fill={flowColor}
            stroke="white"
            strokeWidth="3"
          />
        )}

        {/* Tick marks */}
        {tickMarks.map((tick) => {
          const x = PADDING_X + (tick / MAX_FLOW) * waterAreaWidth
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={GAUGE_HEIGHT - PADDING_Y + 10}
                x2={x}
                y2={GAUGE_HEIGHT - PADDING_Y + 18}
                stroke="var(--color-text-muted)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={GAUGE_HEIGHT - PADDING_Y + 32}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="11"
                fontFamily="var(--font-sans)"
              >
                {tick}
              </text>
            </g>
          )
        })}
      </svg>

      <div className={`flow-status ${hasData ? (isDanger ? 'danger' : 'safe') : 'nodata'}`}>
        <span className="flow-status-dot" />
        {!hasData ? (
          <span>
            Seuil de fermeture : <strong>{THRESHOLD} m³/s</strong> — Débit en temps réel non disponible
          </span>
        ) : isDanger ? (
          <span>
            Débit <strong>trop élevé</strong> — au-dessus du seuil de {THRESHOLD} m³/s
          </span>
        ) : (
          <span>
            Débit <strong>sécuritaire</strong> — sous le seuil de {THRESHOLD} m³/s
          </span>
        )}
      </div>
    </div>
  )
}
