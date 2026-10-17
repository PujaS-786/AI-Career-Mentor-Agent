import React from 'react';

export default function AboutProjectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="glass-card modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 680,
          width: '92%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem 2.2rem',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div>
            <span className="tag tag-success" style={{ fontSize: '0.78rem', marginBottom: 6 }}>
              🎓 Academic Final Year Project — Completed
            </span>
            <h2 style={{ fontSize: '1.7rem', color: '#fff', fontWeight: 800, margin: '4px 0' }}>
              AI Career Mentor Agent
            </h2>
            <p style={{ color: 'var(--primary-glow)', fontSize: '0.95rem', fontWeight: 600 }}>
              Birla Institute of Technology, Mesra (BIT Mesra)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              fontSize: '1.4rem',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* ACADEMIC DETAILS BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            padding: '1rem 1.2rem',
            borderRadius: 12,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Degree / Course
              </span>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>
                Bachelor of Computer Applications (BCA)
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Academic Session
              </span>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>
                2024 – 2027
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Department
              </span>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>
                Computer Science & Applications
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Institution
              </span>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>
                Birla Institute of Technology, Mesra
              </strong>
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS */}
        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          👥 Project Team Members
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {[
            {
              name: 'Riya Rani',
              roll: 'BCA/40009/24',
              role: 'Core AI Agent Pipelines & Prompt Engineering'
            },
            {
              name: 'Shambhavi Shrivastava',
              roll: 'BCA/40010/24',
              role: 'Backend Services, Database & API Integration'
            },
            {
              name: 'Divyanka Singh',
              roll: 'BCA/40026/24',
              role: 'Full-Stack Integration, Voice Mock Interview & UI/UX'
            },
            {
              name: 'Puja Sharma',
              roll: 'BCA/40031/24',
              role: 'Resume ATS Diagnostics, Roadmap Engine & Testing'
            }
          ].map((m, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 10,
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{m.name}</strong>
                <span className="tag tag-info" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  {m.roll}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                {m.role}
              </span>
            </div>
          ))}
        </div>

        {/* PROJECT HIGHLIGHTS */}
        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.8rem' }}>
          🌟 Platform Highlights
        </h4>
        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
            <li><strong style={{ color: '#fff' }}>5 Specialized Autonomous AI Agents</strong>: Orchestrator, Resume Analysis, Skill Gap Analyzer, Roadmap Generator, and Mock Interviewer.</li>
            <li><strong style={{ color: '#fff' }}>Deep ATS Resume Evaluation</strong>: PyPDF & python-docx extraction with ReportLab dynamic single-column ATS PDF compilation.</li>
            <li><strong style={{ color: '#fff' }}>3 Adaptive Career Onboarding Paths</strong>: Built for students with confirmed target roles, comparing roles, or exploring tech careers.</li>
            <li><strong style={{ color: '#fff' }}>Voice & Camera AI Mock Interview</strong>: WebRTC live video feed and browser Web Speech API voice synthesis & recognition with Google Gemini scoring.</li>
            <li><strong style={{ color: '#fff' }}>24/7 Context-Aware AI Mentor</strong>: Persistent chat drawer retaining student goals, skill gaps, and interview analytics.</li>
          </ul>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button className="btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.4rem' }}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
