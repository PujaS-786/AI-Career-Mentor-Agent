import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentDashboard({ user, onNavigate }) {
  const [progressData, setProgressData] = useState(null);
  const [resumeScore, setResumeScore] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progRes, resumeRes, gapRes] = await Promise.all([
        api.progress.get().catch(() => null),
        api.analysis.get().catch(() => null),
        api.skills.getGaps().catch(() => null),
      ]);

      if (progRes) setProgressData(progRes);
      if (resumeRes?.analysis) setResumeScore(resumeRes.analysis.resume_score);
      if (gapRes?.skill_gap) setSkillGap(gapRes.skill_gap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prog = progressData?.progress || {
    overall_progress: 0,
    completed_milestones: 0,
    total_milestones: 0,
    roadmap_progress: 0,
    avg_interview_score: 0,
  };

  return (
    <div>
      {/* HEADER BANNER */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.2))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="tag tag-success" style={{ marginBottom: 6 }}>Live AI Mentor Active</span>
          <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>Welcome Back, {user?.full_name || 'Student'}! 🚀</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Target Goal: <strong style={{ color: '#fff' }}>{user?.target_role || 'Not selected yet'}</strong>
            {' • Target Company: '}
            <strong style={{ color: '#fff' }}>{user?.target_company ? user.target_company : 'Not specified'}</strong>
          </p>
        </div>

        <button className="btn-primary" onClick={() => onNavigate('interview')}>
          🎙️ Start Mock Interview
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid-3">
        {/* OVERALL READINESS */}
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-glow)' }}>
            {prog.overall_progress}%
          </div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginTop: 4 }}>Overall Career Readiness</h4>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${prog.overall_progress}%` }} />
          </div>
        </div>

        {/* RESUME SCORE */}
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#34d399' }}>
            {resumeScore !== null ? `${resumeScore}/100` : 'N/A'}
          </div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginTop: 4 }}>Resume Score</h4>
          <span className="tag tag-success" style={{ fontSize: '0.75rem', marginTop: 4 }}>
            {resumeScore !== null ? 'Agent 2 Analyzed' : 'Upload Resume Required'}
          </span>
        </div>

        {/* MOCK INTERVIEW SCORE */}
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fbbf24' }}>
            {prog.avg_interview_score > 0 ? `${prog.avg_interview_score}%` : 'N/A'}
          </div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginTop: 4 }}>Mock Interview Score</h4>
          <span className="tag tag-warning" style={{ fontSize: '0.75rem', marginTop: 4 }}>
            {prog.avg_interview_score > 0 ? 'Agent 5 Evaluated' : 'No Interview Taken'}
          </span>
        </div>
      </div>

      {/* MID SECTION */}
      <div className="grid-2">
        {/* ROADMAP PROGRESS */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>🗺️ Roadmap Progress</h3>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => onNavigate('roadmap')}>
              View Full Roadmap →
            </button>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Completed Milestones: <strong>{prog.completed_milestones} of {prog.total_milestones}</strong>
          </div>
          <div className="progress-bar-bg" style={{ height: 12 }}>
            <div className="progress-bar-fill" style={{ width: `${prog.total_milestones > 0 ? (prog.completed_milestones / prog.total_milestones) * 100 : 0}%` }} />
          </div>

          {skillGap && (
            <div style={{ marginTop: '1.25rem', padding: '0.8rem', background: 'rgba(10, 13, 20, 0.4)', borderRadius: 8 }}>
              <strong style={{ fontSize: '0.85rem', color: '#fbbf24', display: 'block', marginBottom: 4 }}>
                ⚡ Current Priority Gap to Solve:
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                {skillGap.priority_gaps?.[0] || 'No skill gaps generated yet.'}
              </div>
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY TIMELINE */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>📜 Recent Activity Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {progressData?.recent_activities?.length > 0 ? (
              progressData.recent_activities.slice(0, 4).map((act, idx) => (
                <div key={idx} style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{act.description}</span>
                  <span className="tag tag-info" style={{ fontSize: '0.7rem' }}>{act.activity_type}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }}>
                No activities logged yet. Complete your career assessment and upload your resume to start tracking.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
