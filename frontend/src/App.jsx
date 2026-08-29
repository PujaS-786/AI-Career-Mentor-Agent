import './styles/App.css'
import BackendStatus from '@/components/common/BackendStatus'

function App() {
  return (
    <div className="app-wrapper">
      <div className="hero-card">
        <div className="logo-ring">
          <span className="logo-text">AI</span>
        </div>
        <h1 className="hero-title">AI Career Mentor Agent</h1>
        <p className="hero-subtitle">
          Your personalised, AI-powered career guide — helping you navigate
          roadmaps, bridge skill gaps, and reach your professional goals.
        </p>
        <div className="status-badge">
          <span className="badge-dot" />
          Step 4 — React ↔ Flask Integration
        </div>

        {/* BackendStatus: calls GET /api/v1/health and shows the result */}
        <BackendStatus />
      </div>
    </div>
  )
}

export default App