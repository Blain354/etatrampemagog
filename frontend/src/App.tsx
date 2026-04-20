import { useEffect, useRef, useState } from 'react'
import './App.css'
import { SteelSelect, type SteelSelectOption } from './SteelSelect'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function IconSun() {
  return (
    <svg
      className="theme-toggle-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg
      className="theme-toggle-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function App() {
  const tabs = ['overview', 'analytics', 'settings'] as const
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>('overview')
  const [showModal, setShowModal] = useState(false)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [formError, setFormError] = useState(false)
  const [pillToggle, setPillToggle] = useState(false)
  const [projectType, setProjectType] = useState('saas')
  const modalCloseTimeoutRef = useRef<number | null>(null)

  const projectTypeOptions: SteelSelectOption[] = [
    { value: 'saas', label: 'SaaS app' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'landing', label: 'Landing page' },
  ]
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    return () => {
      if (modalCloseTimeoutRef.current !== null) {
        window.clearTimeout(modalCloseTimeoutRef.current)
      }
    }
  }, [])

  const openModal = () => {
    if (modalCloseTimeoutRef.current !== null) {
      window.clearTimeout(modalCloseTimeoutRef.current)
      modalCloseTimeoutRef.current = null
    }
    setIsModalClosing(false)
    setShowModal(true)
  }

  const closeModal = () => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const closeDelay = prefersReducedMotion ? 0 : 420

    setIsModalClosing(true)
    modalCloseTimeoutRef.current = window.setTimeout(() => {
      setShowModal(false)
      setIsModalClosing(false)
      modalCloseTimeoutRef.current = null
    }, closeDelay)
  }

  const activeTabIndex = tabs.indexOf(activeTab)

  return (
    <div className="app-shell">
      <header className="top-nav">
        <span className="brand">Steel Signature</span>
        <div className="theme-toggle" data-mode={theme} role="group" aria-label="Theme">
          <span
            className="theme-toggle-indicator"
            aria-hidden="true"
            style={{
              width: `calc((100% - 2 * var(--space-1)) / 2)`,
              transform: `translateX(calc(${theme === 'dark' ? 1 : 0} * 100%))`,
            }}
          />
          <button
            type="button"
            className={`theme-toggle-btn ${theme === 'light' ? 'is-active' : ''}`}
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
            title="Light theme"
          >
            <IconSun />
          </button>
          <button
            type="button"
            className={`theme-toggle-btn ${theme === 'dark' ? 'is-active' : ''}`}
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
            title="Dark theme"
          >
            <IconMoon />
          </button>
        </div>
      </header>

      <main className="page">
        <section className="page-header">
          <div>
            <span className="badge">Theme: {theme}</span>
            <h1 className="title">Template Visual Baseline</h1>
            <p className="subtitle">
              Reusable light/dark Steel Signature foundation for future web
              projects.
            </p>
          </div>
          <div className="button-row">
            <button type="button" className="btn btn-primary">
              Primary action
            </button>
            <button type="button" className="btn btn-ghost">
              Secondary action
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Buttons</h2>
          <div className="button-row">
            <button type="button" className="btn btn-primary">
              Primary
            </button>
            <button type="button" className="btn btn-secondary">
              Secondary
            </button>
            <button type="button" className="btn btn-ghost">
              Ghost
            </button>
            <button type="button" className="btn btn-primary" disabled>
              Disabled
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-loading"
              disabled
              aria-busy="true"
            >
              <svg
                className="btn-loading-svg"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  className="btn-loading-perimeter"
                  x="1"
                  y="1"
                  width="98"
                  height="38"
                  rx="9"
                  ry="9"
                  pathLength="100"
                />
              </svg>
              <span className="btn-loading-label">Loading…</span>
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Form controls and states</h2>
          <div className="toggle-row">
            <span className="toggle-row-label" id="toggle-demo-label">
              Feature toggle
            </span>
            <button
              id="demo-toggle"
              type="button"
              role="switch"
              aria-checked={pillToggle}
              aria-labelledby="toggle-demo-label"
              className={`toggle ${pillToggle ? 'toggle-on' : ''}`}
              onClick={() => setPillToggle((v) => !v)}
            >
              <span className="toggle-thumb" aria-hidden="true" />
            </button>
          </div>
          <div className="input-row">
            <div className="field-group">
              <label className="field-label" htmlFor="project-name">
                Project name
              </label>
              <input id="project-name" className="field" type="text" placeholder="Steel app" />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="project-type">
                Project type
              </label>
              <SteelSelect
                id="project-type"
                options={projectTypeOptions}
                value={projectType}
                onChange={setProjectType}
              />
            </div>
            <div className="field-group field-group-wide">
              <label className="field-label" htmlFor="project-desc">
                Description
              </label>
              <textarea
                id="project-desc"
                className="field"
                rows={3}
                placeholder="Short project description"
              ></textarea>
            </div>
          </div>
          <div className="button-row compact">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setFormError((state) => !state)}
            >
              Toggle error state
            </button>
            <input
              className={`field field-inline ${formError ? 'field-error' : ''}`}
              aria-invalid={formError}
              placeholder={formError ? 'Email is required' : 'you@example.com'}
            />
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Tooltips</h2>
          <p className="subtitle tooltip-section-lead">
            Contextual hints on hover and keyboard focus; uses the same surfaces
            and elevation as menus and modals.
          </p>
          <div className="tooltip-row">
            <div className="tooltip">
              <button
                type="button"
                className="tooltip-trigger"
                aria-label="More about tooltips"
                aria-describedby="tooltip-steel-baseline"
              >
                <svg
                  className="tooltip-trigger-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 16v-1M12 8v4.5"
                  />
                </svg>
              </button>
              <span
                id="tooltip-steel-baseline"
                role="tooltip"
                className="tooltip-bubble"
              >
                Short, precise copy for labels, icons, and compact controls.
              </span>
            </div>
            <span className="tooltip-row-hint">
              Hover or focus the control to preview.
            </span>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Navigation and tabs</h2>
          <div className="tabs" role="tablist" aria-label="Example tabs">
            <span
              className="tab-indicator"
              style={{
                // Width must match the padded inner track: `tabs` has horizontal padding,
                // so `100% / n` overflows the last segment (indicator wider than grid cells).
                width: `calc((100% - 2 * var(--space-1)) / ${tabs.length})`,
                transform: `translateX(calc(${activeTabIndex} * 100%))`,
              }}
            />
            {tabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="tab-panel" key={activeTab}>
            Active tab: <strong>{activeTab}</strong>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Cards</h2>
          <div className="grid">
            <article className="card">
              <h4>Default Card</h4>
              <p>Neutral surface and clear structural border.</p>
            </article>
            <article className="card interactive">
              <h4>Interactive Card</h4>
              <p>Subtle hover lift with steel-blue border emphasis.</p>
              <button type="button" className="btn btn-ghost card-action">
                Learn more
              </button>
            </article>
            <article className="card">
              <h4>Content Rhythm</h4>
              <p>4px spacing scale preserves consistent visual cadence.</p>
            </article>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Table</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Status</th>
                  <th>Theme ready</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Buttons</td>
                  <td>
                    <span className="badge">Stable</span>
                  </td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Forms</td>
                  <td>
                    <span className="badge">Stable</span>
                  </td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Data display</td>
                  <td>
                    <span className="badge">In progress</span>
                  </td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Feedback components</h2>
          <div className="status-row">
            <div className="alert success">
              <strong>Success</strong>
              Baseline style applied.
            </div>
            <div className="alert warning">
              <strong>Warning</strong>
              Check contrast when adding custom colors.
            </div>
            <div className="alert error">
              <strong>Error</strong>
              Keep focus ring visible in all states.
            </div>
          </div>
          <div className="skeleton" aria-hidden="true"></div>
          <div className="button-row compact">
            <button type="button" className="btn btn-secondary" onClick={openModal}>
              Open modal preview
            </button>
          </div>
        </section>

        {showModal && (
          <section
            className={`modal-backdrop ${isModalClosing ? 'is-closing' : ''}`}
            aria-label="Modal preview"
          >
            <div className={`modal ${isModalClosing ? 'is-closing' : ''}`}>
              <h3>Modal Component</h3>
              <p className="subtitle">
                This is a showcase modal for spacing, border, and elevation behavior.
              </p>
              <div className="button-row">
                <button type="button" className="btn btn-primary">
                  Confirm
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span className="footer-brand">Steel Signature</span>
        <span className="footer-meta">Template UI baseline · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

export default App
