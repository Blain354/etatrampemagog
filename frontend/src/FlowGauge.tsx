import { useId } from 'react'

const THRESHOLD = 70
const MAX_FLOW = 150
const GAUGE_WIDTH = 600
const GAUGE_HEIGHT = 208
const PADDING_X = 60
const PADDING_TOP = 22
const PADDING_BOTTOM = 42
const BAR_TOP = 48
const BAR_HEIGHT = GAUGE_HEIGHT - BAR_TOP - PADDING_BOTTOM
const TRACK_FILL = 'var(--color-gauge-track)'

interface FlowGaugeProps {
  riverFlow: string | null
}

function parseFlow(flow: string): number {
  const match = flow.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function getLeftRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  if (w <= 0) return ''
  const actualR = Math.min(r, w)
  return `M ${x + actualR},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x + actualR},${y + h} Q ${x},${y + h} ${x},${y + h - actualR} V ${y + actualR} Q ${x},${y} ${x + actualR},${y} Z`
}

export default function FlowGauge({ riverFlow }: FlowGaugeProps) {
  const uid = useId().replace(/:/g, '')
  const flow = riverFlow ? parseFlow(riverFlow) : null
  const hasData = flow !== null && flow > 0
  const isDanger = hasData && flow! > THRESHOLD
  const clampedFlow = hasData ? Math.min(flow!, MAX_FLOW) : 0

  const waterAreaWidth = GAUGE_WIDTH - PADDING_X * 2
  const waterWidth = (clampedFlow / MAX_FLOW) * waterAreaWidth

  // Vitesse d'animation directement proportionnelle au débit.
  // Plus le débit est élevé, plus les vagues bougent vite.
  // À 70 m³/s (seuil), les vagues ont leur vitesse de référence.
  const speedFactor = hasData ? flow! / 70 : 0
  const durationBack = hasData ? 3.0 / speedFactor : 0
  const durationMiddle = hasData ? 2.2 / speedFactor : 0
  const durationFront = hasData ? 1.4 / speedFactor : 0
  const durationStream = hasData ? 3.0 / speedFactor : 0

  const thresholdX = PADDING_X + (THRESHOLD / MAX_FLOW) * waterAreaWidth
  const tickBaseY = GAUGE_HEIGHT - PADDING_BOTTOM + 6
  const tickLabelY = GAUGE_HEIGHT - 10

  const clipId = `waterClip-${uid}`

  return (
    <div
      className="flow-gauge"
      role="img"
      aria-label={
        hasData
          ? `Débit actuel : ${riverFlow}. Seuil de fermeture : ${THRESHOLD} m³/s`
          : `Seuil de fermeture : ${THRESHOLD} m³/s. Données de débit non disponibles.`
      }
    >
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
          <clipPath id={clipId}>
            <path d={getLeftRoundedRectPath(PADDING_X, BAR_TOP, Math.max(waterWidth, 0), BAR_HEIGHT, 14)} />
          </clipPath>
        </defs>

        <path
          d={getLeftRoundedRectPath(PADDING_X, BAR_TOP, waterAreaWidth, BAR_HEIGHT, 14)}
          fill={TRACK_FILL}
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />

        {hasData && waterWidth > 0 ? (
          <g clipPath={`url(#${clipId})`}>
            {/* Layer 1 (Back Wave) */}
            <path
              d="M -300,52 Q -225,47,-150,52 Q -75,57,0,52 Q 75,47,150,52 Q 225,57,300,52 Q 375,47,450,52 Q 525,57,600,52 Q 675,47,750,52 Q 825,57,900,52 V 166 H -300 Z"
              fill="var(--color-gauge-water-shallow)"
              opacity="0.45"
              style={{
                animation: hasData ? `wave-move-right-300 ${durationBack}s linear infinite` : 'none',
              }}
            />
            {/* Layer 2 (Middle Wave) */}
            <path
              d="M -240,60 Q -180,54,-120,60 Q -60,66,0,60 Q 60,54,120,60 Q 180,66,240,60 Q 300,54,360,60 Q 420,66,480,60 Q 540,54,600,60 Q 660,66,720,60 V 166 H -240 Z"
              fill="var(--color-gauge-water-deep)"
              opacity="0.65"
              style={{
                animation: hasData ? `wave-move-right-240 ${durationMiddle}s linear infinite` : 'none',
              }}
            />
            {/* Layer 3 (Front Wave) */}
            <path
              d="M -180,68 Q -135,61,-90,68 Q -45,75,0,68 Q 45,61,90,68 Q 135,75,180,68 Q 225,61,270,68 Q 315,75,360,68 Q 405,61,450,68 Q 495,75,540,68 V 166 H -180 Z"
              fill="var(--color-gauge-water)"
              style={{
                animation: hasData ? `wave-move-right-180 ${durationFront}s linear infinite` : 'none',
              }}
            />
            {/* Stream Flow Particles */}
            {[
              { id: 1, y: 82, w: 22, h: 2.5, delay: 0 },
              { id: 2, y: 100, w: 16, h: 2, delay: -0.6 },
              { id: 3, y: 118, w: 26, h: 2.5, delay: -1.2 },
              { id: 4, y: 136, w: 18, h: 2, delay: -1.8 },
              { id: 5, y: 148, w: 20, h: 2.5, delay: -2.4 },
            ].map((p) => (
              <rect
                key={p.id}
                x={0}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={p.h / 2}
                fill="rgba(255, 255, 255, 0.45)"
                className="flow-stream-line"
                style={{
                  transformOrigin: 'left center',
                  animation: (hasData && durationStream > 0) ? `stream-flow ${durationStream}s linear infinite` : 'none',
                  animationDelay: (hasData && durationStream > 0) ? `${p.delay * durationStream}s` : 'none',
                }}
              />
            ))}
          </g>
        ) : null}

        <line
          x1={thresholdX}
          y1={PADDING_TOP + 12}
          x2={thresholdX}
          y2={BAR_TOP + BAR_HEIGHT - 4}
          stroke="#1e40af"
          strokeWidth="2"
          strokeDasharray="5,4"
          strokeOpacity="0.75"
        />
        <rect
          x={thresholdX - 30}
          y={PADDING_TOP}
          width={60}
          height={22}
          rx={6}
          fill="#1e3a8a"
        />
        <text
          x={thresholdX}
          y={PADDING_TOP + 15}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          {THRESHOLD} SEUIL
        </text>

        {[0, 20, 40, 70, 100, 130, 150].map((tick) => {
          const x = PADDING_X + (tick / MAX_FLOW) * waterAreaWidth
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={tickBaseY}
                x2={x}
                y2={tickBaseY + 7}
                stroke="var(--color-text-muted)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={tickLabelY}
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
            Seuil de fermeture : <strong>{THRESHOLD} m³/s</strong> — débit non disponible
            (voir la page municipale)
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
