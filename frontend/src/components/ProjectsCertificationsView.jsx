import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProjectsCertificationsView({ user }) {
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.roadmap.get();
      setProjects(res.projects || []);
      setCertifications(res.certifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = async (idx) => {
    const p = projects[idx];
    const newStatus = !p.is_completed;
    setProjects((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, is_completed: newStatus } : item))
    );
    if (p.id) {
      try {
        await api.roadmap.toggleProject(p.id, newStatus);
      } catch (err) {
        console.error('Failed to persist project status:', err);
      }
    }
  };

  const toggleCert = async (idx) => {
    const c = certifications[idx];
    const newStatus = !c.is_completed;
    setCertifications((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, is_completed: newStatus } : item))
    );
    if (c.id) {
      try {
        await api.roadmap.toggleCertification(c.id, newStatus);
      } catch (err) {
        console.error('Failed to persist certification status:', err);
      }
    }
  };

  if (loading) return <div className="glass-card">Loading Projects & Certifications...</div>;

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>💻 Practice Projects & Certifications</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Demonstrate your hands-on technical capabilities for <strong>{user?.target_role || 'Not specified'}</strong>
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* PROJECTS SECTION */}
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>🚀 Recommended Practice Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.length > 0 ? (
              projects.map((p, idx) => (
                <div key={idx} className="glass-card" style={{ borderLeft: p.is_completed ? '4px solid #34d399' : '4px solid var(--primary-accent)', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{p.title}</h4>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0' }}>{p.description}</p>
                      <span className="tag tag-info" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                        Difficulty: {p.difficulty || 'Intermediate'}
                      </span>
                    </div>
                    <button
                      className={p.is_completed ? 'btn-secondary' : 'btn-primary'}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                      onClick={() => toggleProject(idx)}
                    >
                      {p.is_completed ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card">
                <p style={{ color: 'var(--text-muted)' }}>Complete onboarding to generate customized practice project recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* CERTIFICATIONS SECTION */}
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>🎓 Industry Certifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {certifications.length > 0 ? (
              certifications.map((c, idx) => (
                <div key={idx} className="glass-card" style={{ borderLeft: c.is_completed ? '4px solid #34d399' : '4px solid #fbbf24', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>{c.title}</h4>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>Provider: {c.provider}</div>
                    </div>
                    <button
                      className={c.is_completed ? 'btn-secondary' : 'btn-primary'}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                      onClick={() => toggleCert(idx)}
                    >
                      {c.is_completed ? '✓ Earned' : 'Mark Earned'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card">
                <p style={{ color: 'var(--text-muted)' }}>Certifications will appear after configuring your target role.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
