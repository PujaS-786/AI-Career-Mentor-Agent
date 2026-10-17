import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SkillGapDashboard({ user, skillGapData }) {
  const [data, setData] = useState(skillGapData);
  const [loading, setLoading] = useState(!skillGapData);

  useEffect(() => {
    if (!skillGapData) {
      api.skills.getGaps()
        .then((res) => {
          setData(res.skill_gap);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [skillGapData]);

  if (loading) return <div className="glass-card">Loading Skill Gap Analysis...</div>;

  if (!data) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>No Skill Gap Analysis Found</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Please complete onboarding or select a target role first.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>🎯 Skill Gap Dashboard</h2>
          <div style={{ color: 'var(--primary-glow)', fontSize: '0.95rem', marginTop: 4 }}>
            Target Role: <strong>{data.target_role || user?.target_role}</strong> • Target Company: <strong>{user?.target_company ? user.target_company : (data.target_company ? data.target_company : 'Not specified')}</strong>
          </div>
        </div>
        <span className="tag tag-info" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Agent 3: Skill Gap Analysis
        </span>
      </div>

      {/* Summary Box */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-accent)' }}>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem' }}>Gap Summary</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{data.gap_summary}</p>
      </div>

      <div className="grid-2">
        {/* PRIORITY GAPS */}
        <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚡ Priority Skill Gaps (Focus First)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.priority_gaps?.map((gap, idx) => (
              <div key={idx} style={{ padding: '0.6rem 0.8rem', borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>{idx + 1}. {gap}</span>
                <span className="tag tag-warning">Priority #{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EXISTING SKILLS */}
        <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#34d399', marginBottom: '1rem' }}>
            ✅ Existing Strong Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.existing_skills?.map((skill, idx) => (
              <span key={idx} className="tag tag-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* WEAK SKILLS */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: '#fbbf24', marginBottom: '1rem' }}>
            ⚠️ Weak / Partially Known Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.weak_skills?.map((skill, idx) => (
              <span key={idx} className="tag tag-warning" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* MISSING SKILLS */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: '#f87171', marginBottom: '1rem' }}>
            ❌ Missing Required Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.missing_skills?.map((skill, idx) => (
              <span key={idx} className="tag tag-danger" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
