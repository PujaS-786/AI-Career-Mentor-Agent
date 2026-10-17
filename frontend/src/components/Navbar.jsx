import React from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onOpenProfile, onToggleMentor, isMentorOpen, onOpenAbout }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setActiveTab('landing')}>
        <div className="brand-icon">AI</div>
        <div>
          <span>Career Mentor Agent</span>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--primary-glow)', fontWeight: 400 }}>
            BIT Mesra · BCA Final Year Project
          </span>
        </div>
      </div>

      <nav className="nav-links">
        <button className={`nav-item ${activeTab === 'landing' ? 'active' : ''}`} onClick={() => setActiveTab('landing')}>
          Home
        </button>
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </button>
        <button className={`nav-item ${activeTab === 'onboarding' ? 'active' : ''}`} onClick={() => setActiveTab('onboarding')}>
          Onboarding
        </button>
        <button className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>
          Resume Analysis
        </button>
        <button className={`nav-item ${activeTab === 'skillgap' ? 'active' : ''}`} onClick={() => setActiveTab('skillgap')}>
          Skill Gap
        </button>
        <button className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
          Roadmap
        </button>
        <button className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          Projects & Certs
        </button>
        <button className={`nav-item ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>
          Mock Interview
        </button>
        <button className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
          Analytics
        </button>
      </nav>

      <div className="nav-user">
        <button
          className="btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', borderColor: 'rgba(168, 85, 247, 0.4)' }}
          onClick={onOpenAbout}
          title="Birla Institute of Technology, Mesra — BCA Project Credits"
        >
          🎓 About Team
        </button>

        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={onToggleMentor}>
          {isMentorOpen ? 'Close AI Mentor' : '💬 AI Mentor'}
        </button>

        {user ? (
          <div className="user-badge" style={{ cursor: 'pointer' }} onClick={onOpenProfile}>
            <span className="badge-dot" style={{ background: '#34d399', width: 8, height: 8, borderRadius: '50%' }} />
            {user.full_name || user.email}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => onOpenAuth('login')}>
              Log In
            </button>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => onOpenAuth('register')}>
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
