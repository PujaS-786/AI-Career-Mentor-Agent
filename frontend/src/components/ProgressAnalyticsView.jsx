import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProgressAnalyticsView({ user }) {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.progress.get()
      .then((res) => {
        setProgressData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card">Loading Progress & Analytics...</div>;

  const prog = progressData?.progress || {
    overall_progress: 0,
    completed_milestones: 0,
    total_milestones: 0,
    roadmap_progress: 0,
    avg_interview_score: 0,
  };

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>📈 Progress & Career Readiness Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Managed by Progress Tracking Service (Flask backend service)
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary-glow)' }}>{prog.overall_progress}%</div>
          <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: 4 }}>Overall Career Readiness</div>
          <div className="progress-bar-bg" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${prog.overall_progress}%` }} />
          </div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#34d399' }}>
            {prog.completed_milestones}/{prog.total_milestones}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: 4 }}>Roadmap Milestones Completed</div>
          <div className="progress-bar-bg" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${prog.total_milestones > 0 ? (prog.completed_milestones / prog.total_milestones) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fbbf24' }}>
            {prog.avg_interview_score > 0 ? `${prog.avg_interview_score}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: 4 }}>Mock Interview Avg Score</div>
          <span className="tag tag-warning" style={{ fontSize: '0.75rem', marginTop: 8 }}>
            {prog.avg_interview_score > 0 ? 'Interview Performance' : 'No Interview Taken'}
          </span>
        </div>
      </div>

      {/* RECENT ACTIVITIES LIST */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>📜 Complete Activity Log Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {progressData?.recent_activities && progressData.recent_activities.length > 0 ? (
            progressData.recent_activities.map((act, idx) => (
              <div key={idx} style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{act.description}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(act.timestamp).toLocaleString()}</span>
                </div>
                <span className="tag tag-info">{act.activity_type}</span>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' }}>
              No progress activities recorded yet. Complete onboarding, resume analysis, or roadmap milestones to track your progress.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
