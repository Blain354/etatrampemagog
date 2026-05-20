import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Anchor, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { apiFetch } from './api'
import type { RampStatus, RampStatusResponse } from './types/ramp'
import './App.css'

type LoadState = 'loading' | 'ready' | 'error'

function formatFetchedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function StatusIcon({ status }: { status: RampStatus }) {
  if (status === 'open') {
    return <CheckCircle2 className="status-icon" aria-hidden="true" />
  }
  if (status === 'closed') {
    return <XCircle className="status-icon" aria-hidden="true" />
  }
  return <AlertCircle className="status-icon" aria-hidden="true" />
}

function App() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [rampStatus, setRampStatus] = useState<RampStatusResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isButtonDisabledTimer, setButtonDisabledTimer] = useState(false)
  const timerRef = useRef<any>(null)

  const loadStatus = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage(null)

    try {
      const response = await apiFetch('/api/ramp-status')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = (await response.json()) as RampStatusResponse
      setRampStatus(data)
      setLoadState('ready')
    } catch {
      setRampStatus(null)
      setErrorMessage(
        'Impossible de charger le statut. Réessayez dans quelques instants.',
      )
      setLoadState('error')
    }
  }, [])

  const handleRefresh = useCallback(() => {
    if (isButtonDisabledTimer) return
    void loadStatus()
    setButtonDisabledTimer(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setButtonDisabledTimer(false)
    }, 10000)
  }, [loadStatus, isButtonDisabledTimer])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const status = rampStatus?.status ?? 'unknown'
  const isRefreshing = loadState === 'loading' && rampStatus !== null

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-row">
          <Anchor className="brand-icon" aria-hidden="true" />
          <div>
            <h1 className="title">Rampe de mise à l&apos;eau</h1>
          </div>
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loadState === 'loading' || isButtonDisabledTimer}
          aria-busy={loadState === 'loading'}
        >
          <RefreshCw className={isRefreshing ? 'spin' : undefined} aria-hidden="true" />
          Actualiser
        </button>
      </header>

      <main className="status-panel-wrap">
        {loadState === 'loading' && rampStatus === null && (
          <section className="status-card status-card-loading" aria-live="polite">
            <Loader2 className="status-icon spin" aria-hidden="true" />
            <p>Chargement du statut…</p>
          </section>
        )}

        {loadState === 'error' && (
          <section className="status-card status-card-error" role="alert">
            <AlertCircle className="status-icon" aria-hidden="true" />
            <p>{errorMessage}</p>
            <button type="button" className="retry-btn" onClick={() => void loadStatus()}>
              Réessayer
            </button>
          </section>
        )}

        {rampStatus && loadState !== 'error' && (
          <section
            className={`status-card status-${status}`}
            aria-live="polite"
            aria-label={`Statut : ${rampStatus.label}`}
          >
            <div className="status-icon-wrap">
              <StatusIcon status={status} />
            </div>
            <p className="status-label">{rampStatus.label}</p>
            <p className="status-hint">
              {status === 'open' && 'La rampe est accessible aux embarcations.'}
              {status === 'closed' && 'La rampe est fermée pour le moment.'}
              {status === 'unknown' &&
                'Le statut n’a pas pu être déterminé clairement à partir des avis municipaux.'}
            </p>

            {status === 'closed' && rampStatus.reopening_date_display && (
              <div className="reopen-block">
                <span className="reopen-label">Réouverture prévue</span>
                <span className="reopen-date">{rampStatus.reopening_date_display}</span>
              </div>
            )}

            {status === 'closed' && !rampStatus.reopening_date_display && (
              <p className="reopen-unknown">
                Date de réouverture non précisée sur le site municipal.
              </p>
            )}

            <p className="meta">
              Dernière mise à jour : {formatFetchedAt(rampStatus.fetched_at)}
            </p>
            <a
              className="source-link"
              href={rampStatus.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir l&apos;avis officiel
            </a>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>Données : Ville de Magog — avis importants</span>
        <span>rampe-magog-etat.blain-projects.ca</span>
      </footer>
    </div>
  )
}

export default App
