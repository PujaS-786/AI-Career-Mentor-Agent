import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function RoadmapDashboard({ user, roadmapData, onMilestoneUpdate }) {
  const [milestones, setMilestones] = useState(roadmapData?.milestones || []);
  const [resources, setResources] = useState(roadmapData?.resources || []);
  const [projects, setProjects] = useState(roadmapData?.projects || []);
  const [certifications, setCertifications] = useState(roadmapData?.certifications || []);
  const [loading, setLoading] = useState(!roadmapData);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await api.roadmap.get();
      setMilestones(res.milestones || []);
      setResources(res.resources || []);
      setProjects(res.projects || []);
      setCertifications(res.certifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (milestoneId, currentStatus) => {
    try {
      const updated = await api.roadmap.toggleMilestone(milestoneId, !currentStatus);
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, is_completed: !currentStatus } : m))
      );
      if (onMilestoneUpdate) onMilestoneUpdate(updated);
    } catch (err) {
      alert(`Failed to update milestone: ${err.message}`);
    }
  };

  if (!loading && milestones.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>No Career Roadmap Generated Yet</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Please complete your Career Assessment, upload your resume, and select a target role in Onboarding to generate your personalized learning roadmap.
        </p>
      </div>
    );
  }

  const completedCount = milestones.filter((m) => m.is_completed).length;
  const progressPercent = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>🗺️ Personalized Career Roadmap</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Tailored learning path for <strong>{user?.target_role || 'Not specified'}</strong> • Target Company: <strong>{user?.target_company ? user.target_company : 'Not specified'}</strong> • {progressPercent}% Completed
          </p>
          <div className="progress-bar-bg" style={{ width: 300, marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <span className="tag tag-info" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Agent 4: Roadmap & Resources
        </span>
      </div>

      {/* MILESTONE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {milestones.map((m) => (
          <div
            key={m.id || m.milestone_order}
            className="glass-card"
            style={{
              borderLeft: m.is_completed ? '6px solid #34d399' : '6px solid var(--primary-accent)',
              opacity: m.is_completed ? 0.85 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="tag tag-info" style={{ marginBottom: '0.5rem' }}>
                  Milestone #{m.milestone_order} • Est. {m.estimated_weeks} Weeks
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0.2rem 0' }}>{m.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>{m.description}</p>
              </div>

              <button
                className={m.is_completed ? 'btn-secondary' : 'btn-primary'}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                onClick={() => handleToggle(m.id, m.is_completed)}
              >
                {m.is_completed ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>

            {/* SKILLS TAUGHT */}
            <div style={{ margin: '0.6rem 0' }}>
              <strong style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                SKILLS IN THIS MILESTONE:
              </strong>
              {m.skills?.map((s, idx) => (
                <span key={idx} className="tag tag-info" style={{ fontSize: '0.8rem' }}>
                  {s}
                </span>
              ))}
            </div>

            {/* LEARNING RESOURCES */}
            {m.resources && m.resources.length > 0 && (
              <div style={{ marginTop: '0.8rem', background: 'rgba(10, 13, 20, 0.4)', padding: '0.8rem', borderRadius: 8 }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block', marginBottom: 6 }}>
                  📚 Recommended Learning Resources:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.resources.map((r, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-glow)', textDecoration: 'none' }}>
                        🔗 {r.title}
                      </a>
                      <span className="tag tag-success" style={{ fontSize: '0.75rem' }}>{r.resource_type || r.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {m.projects && m.projects.length > 0 && (
              <div style={{ marginTop: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.8rem', borderRadius: 8 }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block', marginBottom: 4 }}>
                  💻 Recommended Practice Project:
                </strong>
                {m.projects.map((p, pIdx) => (
                  <div key={pIdx} style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <strong>{p.title}</strong> — {p.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CERTIFICATIONS */}
      {certifications.length > 0 && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.8rem' }}>🎓 Recommended Certifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {certifications.map((c, idx) => (
              <div key={idx} style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#fff', display: 'block' }}>{c.title}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Provider: {c.provider}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
