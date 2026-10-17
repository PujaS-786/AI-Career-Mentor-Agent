import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ResumeAnalysisView({ analysisData }) {
  const [data, setData] = useState(analysisData);
  const [loading, setLoading] = useState(!analysisData);
  const [improvedResume, setImprovedResume] = useState(null);
  const [editableText, setEditableText] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveModal, setShowImproveModal] = useState(false);

  useEffect(() => {
    if (!analysisData) {
      api.analysis.get()
        .then((res) => {
          setData(res.analysis);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [analysisData]);

  useEffect(() => {
    api.resume.getImproved().then((res) => {
      if (res.improved_resume) {
        setImprovedResume(res.improved_resume);
        setEditableText(res.improved_resume.improved_text);
      }
    }).catch(() => {});
  }, []);

  const handleGenerateImprovement = async () => {
    setIsImproving(true);
    try {
      const res = await api.resume.improve();
      setImprovedResume(res.improved_resume);
      setEditableText(res.improved_resume.improved_text);
      setShowImproveModal(true);
    } catch (err) {
      alert(`Error generating improved resume draft: ${err.message}`);
    } finally {
      setIsImproving(false);
    }
  };

  const handleTextChange = async (newText) => {
    setEditableText(newText);
    try {
      await api.resume.updateImprovedText(newText);
    } catch (err) {
      console.error('Failed to sync text edits:', err);
    }
  };

  if (loading) return <div className="glass-card">Loading Resume & Profile Analysis...</div>;

  if (!data) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>No Resume Analysis Found</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Please upload your resume in the Onboarding section first.
        </p>
      </div>
    );
  }

  const profile = data.structured_profile || {};
  const contact = profile.contact_info || {};
  const ats = data.ats_analysis || {};

  return (
    <div>
      {/* HEADER BANNER WITH SCORES */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>📄 Resume Quality & ATS Analysis</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Evaluated by Agent 2: Resume & Profile Analysis Agent
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399' }}>
              {data.resume_score}/100
            </div>
            <span className="tag tag-success">Resume Score</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fbbf24' }}>
              {data.ats_score !== undefined && data.ats_score !== null ? `${data.ats_score}/100` : 'N/A'}
            </div>
            <span className="tag tag-warning">ATS Compatibility</span>
          </div>

          {improvedResume ? (
            <button className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={async () => {
              try {
                await api.resume.downloadPdf(editableText);
              } catch (err) {
                alert(err.message);
              }
            }}>
              📥 Download PDF
            </button>
          ) : null}

          <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={handleGenerateImprovement} disabled={isImproving}>
            {isImproving ? 'Generating Draft...' : '✨ Improve My Resume'}
          </button>
        </div>
      </div>

      {/* SUMMARY BOX */}
      <div className="glass-card" style={{ borderLeft: '4px solid #34d399' }}>
        <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>Profile Summary</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{data.profile_summary}</p>
        {ats.score_breakdown && (
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 6 }}>
            <strong>Score Breakdown:</strong> {ats.score_breakdown}
          </p>
        )}
      </div>

      {/* VERIFIED CONTACT DETAILS & HYPERLINKS */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>📞 Verified Contact Details & Hyperlinks</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {contact.full_name && (
            <div style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', fontSize: '0.88rem', color: '#fff' }}>
              👤 <strong>Name:</strong> {contact.full_name}
            </div>
          )}
          {contact.email && (
            <div style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', fontSize: '0.88rem', color: '#fff' }}>
              ✉️ <strong>Email:</strong> {contact.email}
            </div>
          )}
          {contact.phone && (
            <div style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', fontSize: '0.88rem', color: '#fff' }}>
              ☎️ <strong>Phone:</strong> {contact.phone}
            </div>
          )}
          {contact.linkedin_url && (
            <div style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.88rem', color: '#34d399' }}>
              🔗 <strong>LinkedIn:</strong> <a href={contact.linkedin_url.startsWith('http') ? contact.linkedin_url : `https://${contact.linkedin_url}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>{contact.linkedin_url}</a>
            </div>
          )}
          {contact.github_url && (
            <div style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.88rem', color: '#a5b4fc' }}>
              🐙 <strong>GitHub:</strong> <a href={contact.github_url.startsWith('http') ? contact.github_url : `https://${contact.github_url}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>{contact.github_url}</a>
            </div>
          )}
          {contact.location && (
            <div style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', fontSize: '0.88rem', color: '#cbd5e1' }}>
              📍 <strong>Location:</strong> {contact.location}
            </div>
          )}
        </div>
      </div>

      {/* ATS CHECK BREAKDOWN */}
      {ats && Object.keys(ats).length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>🤖 ATS Compatibility Checks & Diagnostics</h3>
          <div className="grid-2">
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>CONTACT INFO COMPLETENESS</strong>
              <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{ats.contact_information_completeness}</span>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>EDUCATION SECTION FORMATTING</strong>
              <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{ats.education_completeness}</span>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>EXPERIENCE & PROJECT QUALITY</strong>
              <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{ats.experience_and_project_quality}</span>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>KEYWORDS VISIBILITY</strong>
              <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{ats.skills_visibility}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* STRENGTHS */}
        <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#34d399', marginBottom: '1rem' }}>
            💪 Identified Strengths
          </h3>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {data.strengths?.map((s, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* MISSING AREAS */}
        <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fbbf24', marginBottom: '1rem' }}>
            ⚠️ Actionable Improvement Areas
          </h3>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {data.missing_areas?.map((m, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* EXTRACTED SKILLS & DETAILS */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>🛠️ Extracted Technical & Soft Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {profile.skills?.map((skill, idx) => (
            <span key={idx} className="tag tag-info" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* IMPROVED RESUME MODAL / VIEW */}
      {showImproveModal && improvedResume && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-card" style={{ width: 760, maxHeight: '88vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setShowImproveModal(false)}>✕</button>

            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>✨ ATS-Optimized Resume Draft</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Single-column, clean ATS format using verified facts. You can review and edit below.
            </p>

            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 8, border: '1px solid var(--primary-accent)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--primary-glow)', fontSize: '0.85rem', display: 'block', marginBottom: 6 }}>
                💡 Key Enhancements Applied:
              </strong>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#fff' }}>
                {improvedResume.improvement_notes?.map((n, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{n}</li>
                ))}
              </ul>
            </div>

            <textarea
              className="form-textarea"
              style={{
                width: '100%',
                height: 320,
                background: 'rgba(10, 13, 20, 0.95)',
                color: '#e2e8f0',
                fontSize: '0.88rem',
                fontFamily: 'monospace',
                padding: '1rem',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
              }}
              value={editableText}
              onChange={(e) => handleTextChange(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => setShowImproveModal(false)}>Close Review</button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    try {
                      await api.resume.downloadPdf(editableText);
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  📥 Download PDF
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(editableText);
                    alert('Improved resume text copied to clipboard!');
                  }}
                >
                  📋 Copy Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
