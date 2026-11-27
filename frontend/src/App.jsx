import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8080/api/applications'

const STATUSES = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
]

const EMPTY_FORM = {
  company: '',
  position: '',
  location: '',
  jobUrl: '',
  status: 'APPLIED',
  appliedDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

const statusLabel = (value) =>
  STATUSES.find((status) => status.value === value)?.label || value

function App() {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (statusFilter) params.set('status', statusFilter)

      const [applicationsResponse, statsResponse] = await Promise.all([
        fetch(`${API}?${params.toString()}`),
        fetch(`${API}/stats`),
      ])

      if (!applicationsResponse.ok || !statsResponse.ok) {
        throw new Error('Could not load application data.')
      }

      setApplications(await applicationsResponse.json())
      setStats(await statsResponse.json())
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [query, statusFilter])

 

  function openCreate() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, appliedDate: new Date().toISOString().slice(0, 10) })
    setShowForm(true)
  }

  function openEdit(application) {
    setEditingId(application.id)
    setForm({
      company: application.company || '',
      position: application.position || '',
      location: application.location || '',
      jobUrl: application.jobUrl || '',
      status: application.status || 'APPLIED',
      appliedDate: application.appliedDate || '',
      notes: application.notes || '',
    })
    setShowForm(true)
  }

  function updateForm(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function submitForm(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to save application.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to save application.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteApplication(id) {
    if (!window.confirm('Delete this job application?')) return

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to delete application.')
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">J</div>
          <div>
            <strong>Jobflow</strong>
            <span>APPLICATION TRACKER</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <button className="nav-item active" type="button">
          <span className="nav-icon">▦</span> Dashboard
        </button>
        <button className="nav-item" type="button" onClick={openCreate}>
          <span className="nav-icon">＋</span> Add application
        </button>

        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>
          <div className="profile-info">
            <strong>My workspace</strong>
            <span>Personal job search</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Dashboard</div>
          <div className="topbar-right">
            <span className="live-dot" /> Tracking your progress
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR CAREER JOURNEY</p>
              <h1>Application dashboard</h1>
              <p className="page-subtitle">
                Keep every opportunity organized. Your next role is closer than you think.
              </p>
            </div>
            <button className="primary-button" onClick={openCreate} type="button">
              <span>＋</span> Add application
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <section className="stats-grid">
            <StatCard label="Total applications" value={stats.total ?? 0} icon="▤" tone="violet" />
            <StatCard label="In progress" value={(stats.screening ?? 0) + (stats.interview ?? 0)} icon="◷" tone="blue" />
            <StatCard label="Interviews" value={stats.interview ?? 0} icon="♧" tone="orange" />
            <StatCard label="Offers received" value={stats.offer ?? 0} icon="✧" tone="green" />
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Recent applications</h2>
                <p>Your latest job opportunities</p>
              </div>
              <button className="text-button" type="button" onClick={loadData}>
                ↻ Refresh
              </button>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search company, role or location..."
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>COMPANY & ROLE</th>
                    <th>LOCATION</th>
                    <th>APPLIED DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="empty-state">Loading applications...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <div className="empty-icon">▤</div>
                        <strong>No applications yet</strong>
                        <p>Add your first job application to start tracking.</p>
                        <button className="primary-button small" onClick={openCreate} type="button">
                          ＋ Add application
                        </button>
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <div className="company-cell">
                            <div className="company-logo">
                              {(application.company || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{application.company}</strong>
                              <span>{application.position}</span>
                            </div>
                          </div>
                        </td>
                        <td>{application.location || '—'}</td>
                        <td>{application.appliedDate || '—'}</td>
                        <td>
                          <span className={`status-badge ${application.status?.toLowerCase()}`}>
                            <span /> {statusLabel(application.status)}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            {application.jobUrl && (
                              <a href={application.jobUrl} target="_blank" rel="noreferrer" title="Open job link">↗</a>
                            )}
                            <button type="button" onClick={() => openEdit(application)} title="Edit">✎</button>
                            <button type="button" onClick={() => deleteApplication(application.id)} title="Delete">⌫</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing {applications.length} application{applications.length === 1 ? '' : 's'}</span>
              <span>Keep going — every application counts.</span>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel status-panel">
              <div className="panel-heading">
                <div>
                  <h2>Application pipeline</h2>
                  <p>Where your applications stand</p>
                </div>
              </div>
              <div className="pipeline-list">
                {STATUSES.map((status) => {
                  const count = stats[status.value.toLowerCase()] ?? 0
                  const total = Math.max(stats.total ?? 0, 1)
                  return (
                    <div className="pipeline-row" key={status.value}>
                      <div className="pipeline-label">
                        <span>{status.label}</span>
                        <strong>{count}</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${status.value.toLowerCase()}`}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="panel tip-panel">
              <div className="tip-icon">✦</div>
              <p className="eyebrow">A LITTLE REMINDER</p>
              <h2>Progress over perfection.</h2>
              <p>
                Every application is a step forward. Stay consistent, follow up,
                and keep building your career.
              </p>
              <button className="text-button" type="button" onClick={openCreate}>
                Track another opportunity →
              </button>
            </div>
          </section>

          <footer className="footer">
            <span>Jobflow · Job Application Tracker</span>
            <span>Built to keep your career moving.</span>
          </footer>
        </section>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowForm(false)
        }}>
          <form className="application-form" onSubmit={submitForm}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">{editingId ? 'UPDATE OPPORTUNITY' : 'NEW OPPORTUNITY'}</p>
                <h2>{editingId ? 'Edit application' : 'Add application'}</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>

            <label>
              Company *
              <input name="company" value={form.company} onChange={updateForm} required maxLength="120" placeholder="e.g. Google" />
            </label>
            <label>
              Job title *
              <input name="position" value={form.position} onChange={updateForm} required maxLength="120" placeholder="e.g. Data Analyst" />
            </label>
            <div className="form-row">
              <label>
                Location
                <input name="location" value={form.location} onChange={updateForm} placeholder="e.g. Bengaluru" />
              </label>
              <label>
                Applied date
                <input name="appliedDate" type="date" value={form.appliedDate} onChange={updateForm} />
              </label>
            </div>
            <label>
              Status
              <select name="status" value={form.status} onChange={updateForm}>
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </label>
            <label>
              Job link
              <input name="jobUrl" type="url" value={form.jobUrl} onChange={updateForm} placeholder="https://..." />
            </label>
            <label>
              Notes
              <textarea name="notes" value={form.notes} onChange={updateForm} rows="3" placeholder="Recruiter, follow-up, interview notes..." />
            </label>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add application'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-caption">Updated from your applications</div>
    </div>
  )
}

export default App
