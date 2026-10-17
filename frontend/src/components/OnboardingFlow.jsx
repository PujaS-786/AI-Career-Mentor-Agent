import React, { useState } from 'react';
import api from '../services/api';

const PREDEFINED_ROLES = [
  'Software Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Frontend Developer',
  'Backend Developer',
  'Cloud / DevOps Engineer',
];

export default function OnboardingFlow({ user, onCompleteOnboarding }) {
  const [step, setStep] = useState(1); // 1: Path Choice, 2: Path 1/2 setup, 3: Assessment, 4: Resume, 4.5: Analysis & Missing Info, 5: Match Results & Final Selection
  const [selectedPath, setSelectedPath] = useState(''); // path1, path2, path3

  // Path 1 states
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  // Path 2 states
  const [preferredRoles, setPreferredRoles] = useState([]);
  const [hasCustomRole, setHasCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');

  // Validation / Error state
  const [validationError, setValidationError] = useState('');

  // Synchronize with existing user profile and restore saved progress if authenticated
  React.useEffect(() => {
    if (user?.target_role && !targetRole) {
      setTargetRole(user.target_role);
    }
    if (user?.target_company && !targetCompany) {
      setTargetCompany(user.target_company);
    }
    if (user?.onboarding_path && !selectedPath) {
      setSelectedPath(user.onboarding_path);
    }

    if (user) {
      // Restore any existing analysis and improved resume data
      api.analysis.get()
        .then((res) => {
          if (res?.analysis) {
            setAnalysisResult(res.analysis);
            if (res.analysis.structured_profile_json) {
              try {
                const structured = JSON.parse(res.analysis.structured_profile_json);
                const contact = structured.contact_info || {};
                setConfirmedProfile((prev) => ({
                  ...prev,
                  contact_info: {
                    full_name: contact.full_name || user.full_name || '',
                    email: contact.email || user.email || '',
                    phone: contact.phone || prev.contact_info.phone || '',
                    linkedin_url: contact.linkedin_url || prev.contact_info.linkedin_url || '',
                    github_url: contact.github_url || prev.contact_info.github_url || '',
                    location: contact.location || prev.contact_info.location || '',
                  },
                  education: structured.education || prev.education,
                  skills: structured.skills || prev.skills,
                  projects: structured.projects || prev.projects,
                  experience: structured.experience || prev.experience,
                  certifications: structured.certifications || prev.certifications,
                }));
              } catch { }
            }
          }
        })
        .catch(() => {});

      api.resume.getImproved()
        .then((res) => {
          if (res?.improved_resume) {
            setImprovedResumeData(res.improved_resume);
            setImprovedTextContent(res.improved_resume.improved_text || '');
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Career Assessment states
  const [assessment, setAssessment] = useState({
    career_interests: '',
    current_technical_skills: '',
    soft_skills: '',
    experience_level: 'Student / Beginner',
    education_background: user?.degree || '',
    areas_enjoyed: '',
    areas_to_learn: '',
    preferred_work_type: 'Full-time Remote / Hybrid',
    career_goals: '',
  });

  // Resume states
  const [resumeFile, setResumeFile] = useState(null);

  // Results states
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [roleMatches, setRoleMatches] = useState([]);
  const [selectedFinalRole, setSelectedFinalRole] = useState('');
  const [finalTargetCompany, setFinalTargetCompany] = useState('');

  // Missing Information Collection & Review state
  const [confirmedProfile, setConfirmedProfile] = useState({
    contact_info: {
      full_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      github_url: '',
      location: '',
    },
    education: [],
    skills: [],
    projects: [],
    experience: [],
    certifications: [],
  });
  const [isEditingMissingInfo, setIsEditingMissingInfo] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState(null);
  const [improvedTextContent, setImprovedTextContent] = useState('');
  const [isGeneratingImproved, setIsGeneratingImproved] = useState(false);

  // Handler for Path Decision
  const handlePathChoice = (path) => {
    setSelectedPath(path);
    setValidationError('');
    if (path === 'path1') {
      setStep(2); // Target Role Input
    } else if (path === 'path2') {
      setStep(2); // Preferred Roles Input
    } else if (path === 'path3') {
      setStep(3); // Career Assessment directly (role decided later)
    }
  };

  // Validation & Handler for Path 1 Step 2
  const handleProceedFromPath1Step2 = () => {
    if (!targetRole.trim()) {
      setValidationError('Target role is required.');
      return;
    }
    setValidationError('');
    setStep(3);
  };

  // Validation & Handler for Path 2 Step 2
  const togglePredefinedRole = (role) => {
    setValidationError('');
    if (preferredRoles.includes(role)) {
      setPreferredRoles(preferredRoles.filter((r) => r !== role));
    } else {
      const currentCount = preferredRoles.length + (hasCustomRole && customRoleText.trim() ? 1 : 0);
      if (currentCount >= 4) {
        setValidationError('You can select a maximum of 4 preferred roles.');
        return;
      }
      setPreferredRoles([...preferredRoles, role]);
    }
  };

  const handleProceedFromPath2Step2 = () => {
    let effectiveRoles = [...preferredRoles];
    if (hasCustomRole) {
      const trimmed = customRoleText.trim();
      if (!trimmed) {
        setValidationError('Please enter your custom role preference or uncheck "Other".');
        return;
      }
      if (!effectiveRoles.includes(trimmed)) {
        effectiveRoles.push(trimmed);
      }
    }

    if (effectiveRoles.length === 0) {
      setValidationError('Please select or enter at least 1 preferred role.');
      return;
    }

    if (effectiveRoles.length > 4) {
      setValidationError('You can select a maximum of 4 preferred roles.');
      return;
    }

    setValidationError('');
    setStep(3);
  };

  const handleProceedToResumeUpload = () => {
    if (!assessment.career_interests || !assessment.career_interests.trim()) {
      setValidationError('Career interest is required. Please fill in your career interest before proceeding.');
      return;
    }
    setValidationError('');
    setStep(4);
  };

  // Submit Assessment & Resume Analysis (Step 4 -> Step 4.5 Resume Analysis Stage)
  const handleProcessFlow = async () => {
    if (!resumeFile) {
      setValidationError('Please select a valid resume file (PDF or DOCX) before continuing.');
      return;
    }

    const fileName = resumeFile.name || '';
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      setValidationError('The uploaded document does not appear to be a valid resume format. Please upload a valid PDF or DOCX resume document (presentations, PPT/PPTX files, images, and text notes are not accepted).');
      return;
    }

    setLoading(true);
    setValidationError('');
    try {
      // 1. Submit Assessment with confirmed target role and company for Path 1
      await api.assessment.submit({
        ...assessment,
        target_role: selectedPath === 'path1' ? targetRole.trim() : null,
        target_company: selectedPath === 'path1' ? targetCompany.trim() : null,
        onboarding_path: selectedPath,
      });

      // 2. Upload Resume File
      const formData = new FormData();
      formData.append('file', resumeFile);
      await api.resume.upload(formData);

      // 3. Analyze Resume via Orchestrator
      const analysisRes = await api.analysis.analyzeResume();
      const analysisObj = analysisRes.analysis || {};
      setAnalysisResult(analysisObj);

      // Populate review state with verified extracted details (location is strictly optional)
      const structured = analysisObj.structured_profile || {};
      const contact = structured.contact_info || {};
      setConfirmedProfile({
        contact_info: {
          full_name: contact.full_name || user?.full_name || '',
          email: contact.email || user?.email || '',
          phone: contact.phone || '',
          linkedin_url: contact.linkedin_url || '',
          github_url: contact.github_url || '',
          location: contact.location || '',
        },
        education: structured.education || [],
        skills: structured.skills || [],
        projects: structured.projects || [],
        experience: structured.experience || [],
        certifications: structured.certifications || [],
      });

      // Transition to Step 4.5 (Resume Analysis & Missing Info Review Stage)
      setStep(4.5);
    } catch (err) {
      setValidationError(err.message || 'Error processing resume upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImprovedResume = async () => {
    setIsGeneratingImproved(true);
    setValidationError('');
    try {
      // 1. Persist user-confirmed details first
      await api.resume.confirmDetails(confirmedProfile);

      // 2. Generate improved ATS resume using confirmed details
      const effectiveRole = selectedPath === 'path1' ? targetRole.trim() : null;
      const effectiveCompany = selectedPath === 'path1' ? targetCompany.trim() : null;
      const res = await api.resume.improve(confirmedProfile);
      const imp = res.improved_resume;
      setImprovedResumeData(imp);
      setImprovedTextContent(imp.improved_text);
    } catch (err) {
      setValidationError(`Error generating improved resume: ${err.message}`);
    } finally {
      setIsGeneratingImproved(false);
    }
  };

  const handleSaveTextChanges = async (newText) => {
    setImprovedTextContent(newText);
    try {
      await api.resume.updateImprovedText(newText);
    } catch (err) {
      console.error('Failed to auto-save resume text edits:', err);
    }
  };

  const handleContinueAfterResumeReview = async () => {
    if (loading) return; // Prevent duplicate clicks
    setLoading(true);
    setValidationError('');
    try {
      if (selectedPath === 'path1') {
        const effectiveRole = (targetRole || user?.target_role || '').trim();
        const effectiveCompany = (targetCompany || user?.target_company || '').trim();

        if (!effectiveRole) {
          setValidationError('Target role is not confirmed. Please enter or confirm your target role.');
          setLoading(false);
          return;
        }

        const selectRes = await api.roles.select(effectiveRole, effectiveCompany);
        onCompleteOnboarding(selectRes);
      } else {
        let rolesToMatch = [];
        if (selectedPath === 'path2') {
          rolesToMatch = [...preferredRoles];
          if (hasCustomRole && customRoleText.trim()) {
            if (!rolesToMatch.includes(customRoleText.trim())) {
              rolesToMatch.push(customRoleText.trim());
            }
          }
        }
        const matchRes = await api.roles.match(rolesToMatch);
        const matches = matchRes.matches || [];
        setRoleMatches(matches);
        if (matches.length > 0) {
          setSelectedFinalRole(matches[0].role_name);
        }
        setStep(5);
      }
    } catch (err) {
      console.error('Workflow transition error:', err);
      setValidationError(err.message || 'Failed to advance to the next stage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Final Role Confirmation (Step 5 for Path 2 & Path 3)
  const handleConfirmFinalRole = async () => {
    if (loading) return; // Prevent duplicate clicks
    if (!selectedFinalRole) {
      setValidationError('Please select a target role before continuing.');
      return;
    }
    setLoading(true);
    setValidationError('');
    try {
      const effectiveCompany = (finalTargetCompany || targetCompany || user?.target_company || '').trim();
      const selectRes = await api.roles.select(selectedFinalRole, effectiveCompany);
      onCompleteOnboarding(selectRes);
    } catch (err) {
      console.error('Final role confirmation error:', err);
      setValidationError(err.message || 'Error confirming role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* GLOBAL VALIDATION ERROR BANNER */}
      {validationError && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          ⚠️ {validationError}
        </div>
      )}

      {/* STEP 1: PATH SELECTION */}
      {step === 1 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
            Welcome, {user?.full_name || 'Student'}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            To personalize your AI Career Mentor experience, tell us about your career path status:
          </p>

          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--primary-glow)' }}>
            Have you decided your target role?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* PATH 1 */}
            <div
              className="glass-card"
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                border: selectedPath === 'path1' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                background: 'rgba(99, 102, 241, 0.1)',
              }}
              onClick={() => handlePathChoice('path1')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>🎯 Path 1: "Yes, I have decided my target role."</h4>
                <span className="tag tag-success">Target Role Confirmed</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                You know your goal (e.g. Software Developer). We will immediately analyze your resume, collect any missing information, and tailor your roadmap.
              </p>
            </div>

            {/* PATH 2 */}
            <div
              className="glass-card"
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                border: selectedPath === 'path2' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                background: 'rgba(16, 185, 129, 0.1)',
              }}
              onClick={() => handlePathChoice('path2')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>🔍 Path 2: "I have a few roles in mind but I am not sure."</h4>
                <span className="tag tag-warning">Max 4 Preferred Roles</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Compare your skills across 1 to 4 candidate roles with career-match percentages based on your verified resume before choosing your final target role.
              </p>
            </div>

            {/* PATH 3 */}
            <div
              className="glass-card"
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                border: selectedPath === 'path3' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                background: 'rgba(245, 158, 11, 0.1)',
              }}
              onClick={() => handlePathChoice('path3')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>💡 Path 3: "I have not decided my target role yet."</h4>
                <span className="tag tag-info">AI Career Recommendation</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                No problem! Our analysis will evaluate your assessment and resume to recommend suitable career roles with evidence-based match scores before you confirm one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PATH 1 TARGET ROLE / COMPANY */}
      {step === 2 && selectedPath === 'path1' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#fff' }}>🎯 Path 1: Set Target Role & Target Company</h3>
          
          <div className="form-group">
            <label className="form-label">Target Role <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              className="form-input"
              placeholder="e.g. Software Developer, Data Analyst, AI/ML Engineer"
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                setValidationError('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Company (OPTIONAL PREFERENCE)</label>
            <input
              className="form-input"
              placeholder="e.g. Google, Microsoft, Amazon (Leave blank if not specified)"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Used as a tailoring preference only; will not be listed as an employer on your resume.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn-secondary" onClick={() => { setValidationError(''); setStep(1); }}>← Back</button>
            <button className="btn-primary" onClick={handleProceedFromPath1Step2}>
              Continue to Career Assessment →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PATH 2 PREFERRED ROLES SELECTION */}
      {step === 2 && selectedPath === 'path2' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>🔍 Path 2: Select Preferred Roles (Max 4)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Choose up to 4 roles you are considering. You can also enter a custom role preference below.
          </p>

          {/* PREDEFINED ROLES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {PREDEFINED_ROLES.map((role) => {
              const selected = preferredRoles.includes(role);
              return (
                <div
                  key={role}
                  onClick={() => togglePredefinedRole(role)}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 10,
                    border: selected ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                    background: selected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(10, 13, 20, 0.4)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {selected ? '✓ ' : '+ '} {role}
                </div>
              );
            })}
          </div>

          {/* CUSTOM ROLE OPTION */}
          <div style={{ padding: '1rem', borderRadius: 10, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="customRoleToggle"
                checked={hasCustomRole}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setValidationError('');
                  if (checked) {
                    const currentCount = preferredRoles.length;
                    if (currentCount >= 4) {
                      setValidationError('You can select a maximum of 4 preferred roles.');
                      return;
                    }
                  }
                  setHasCustomRole(checked);
                }}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="customRoleToggle" style={{ color: '#fff', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600 }}>
                Other — Enter your preference here
              </label>
            </div>

            {hasCustomRole && (
              <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Custom Preferred Role Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Cloud Solutions Architect, Fullstack Developer"
                  value={customRoleText}
                  onChange={(e) => {
                    setCustomRoleText(e.target.value);
                    setValidationError('');
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-secondary" onClick={() => { setValidationError(''); setStep(1); }}>← Back</button>
            <button className="btn-primary" onClick={handleProceedFromPath2Step2}>
              Continue to Career Assessment →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CAREER ASSESSMENT FORM */}
      {step === 3 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>📝 Structured Career Assessment</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Tell us about your interests, current skills, and career aspirations.
          </p>

          <div className="form-group">
            <label className="form-label">Career Interests <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              className="form-input"
              placeholder="e.g. Fullstack Web Development, Data Engineering, AI Systems"
              value={assessment.career_interests}
              onChange={(e) => {
                setAssessment({ ...assessment, career_interests: e.target.value });
                setValidationError('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Technical Skills (comma separated)</label>
            <input className="form-input" value={assessment.current_technical_skills} onChange={(e) => setAssessment({ ...assessment, current_technical_skills: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Soft Skills</label>
            <input className="form-input" value={assessment.soft_skills} onChange={(e) => setAssessment({ ...assessment, soft_skills: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select className="form-select" value={assessment.experience_level} onChange={(e) => setAssessment({ ...assessment, experience_level: e.target.value })}>
                <option value="Student / Beginner">Student / Beginner</option>
                <option value="Intermediate">Intermediate (1-2 years experience)</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Education / Background</label>
              <input className="form-input" value={assessment.education_background} onChange={(e) => setAssessment({ ...assessment, education_background: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Areas You Enjoy</label>
            <input className="form-input" value={assessment.areas_enjoyed} onChange={(e) => setAssessment({ ...assessment, areas_enjoyed: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Areas You Want to Learn</label>
            <input className="form-input" value={assessment.areas_to_learn} onChange={(e) => setAssessment({ ...assessment, areas_to_learn: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Career Goals</label>
            <textarea className="form-textarea" rows={2} value={assessment.career_goals} onChange={(e) => setAssessment({ ...assessment, career_goals: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn-secondary" onClick={() => { setValidationError(''); setStep(selectedPath === 'path3' ? 1 : 2); }}>← Back</button>
            <button className="btn-primary" onClick={handleProceedToResumeUpload}>Proceed to Resume Upload →</button>
          </div>
        </div>
      )}

      {/* STEP 4: RESUME UPLOAD */}
      {step === 4 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>📄 Resume Upload & Document Validation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Upload your resume document in <strong>PDF or DOCX</strong> format. Presentation slides (PPT/PPTX), pitch decks, and non-resume documents are rejected.
          </p>

          <div className="form-group">
            <label className="form-label">Upload Resume File (PDF / DOCX) <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              className="form-input"
              style={{ padding: '0.5rem' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0];
                  const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
                  if (!['.pdf', '.docx', '.doc'].includes(ext)) {
                    setValidationError('Invalid file format. Please upload a valid PDF or DOCX resume document (presentations, PPT/PPTX files, and images are rejected).');
                    setResumeFile(null);
                    return;
                  }
                  setResumeFile(f);
                  setValidationError('');
                }
              }}
            />
            {resumeFile && <div style={{ fontSize: '0.85rem', color: '#34d399', marginTop: 6, fontWeight: 500 }}>✓ Selected File: {resumeFile.name}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={() => { setValidationError(''); setStep(3); }}>← Back</button>
            <button className="btn-primary" onClick={handleProcessFlow} disabled={loading || !resumeFile}>
              {loading ? 'Validating & Analyzing Resume...' : 'Run Resume Analysis →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4.5: RESUME ANALYSIS, MISSING INFO COLLECTION & ATS RESUME GENERATION */}
      {step === 4.5 && analysisResult && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="tag tag-success">Verified Resume Analyzed</span>
                {(analysisResult.target_role || (selectedPath === 'path1' && targetRole)) && (
                  <span className="tag tag-info" style={{ background: 'rgba(3, 105, 161, 0.25)', border: '1px solid #0284c7', color: '#38bdf8' }}>
                    🎯 Confirmed Target Role: {analysisResult.target_role || targetRole}
                  </span>
                )}
                {selectedPath !== 'path1' && !analysisResult.target_role && (
                  <span className="tag tag-warning" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24' }}>
                    💡 Target Role Decided in Next Stage
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: 6 }}>
                Resume Analysis & ATS Optimization
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399' }}>
                {analysisResult.resume_score}/100
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evidence-Based Score</span>
            </div>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.8rem', borderRadius: 8 }}>
            {analysisResult.profile_summary}
          </p>

          {/* STRENGTHS & SUGGESTIONS */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <strong style={{ color: '#34d399', fontSize: '0.95rem', display: 'block', marginBottom: 6 }}>
                💪 Verified Strengths:
              </strong>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#fff' }}>
                {analysisResult.strengths?.map((s, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <strong style={{ color: '#fbbf24', fontSize: '0.95rem', display: 'block', marginBottom: 6 }}>
                ⚠️ Actionable Improvements:
              </strong>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#fff' }}>
                {analysisResult.missing_areas?.map((m, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* MISSING INFORMATION COLLECTION / VERIFICATION DRAWER */}
          <div style={{ padding: '1.25rem', borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>📋 Verified Extracted Details & Optional Information</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Review your extracted resume details. Supplement missing fields or skip optional ones. No information is fabricated.
                </p>
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => setIsEditingMissingInfo(!isEditingMissingInfo)}
              >
                {isEditingMissingInfo ? 'Hide Form' : '✏️ Review / Edit Details'}
              </button>
            </div>

            {/* QUICK PREVIEW OF EXTRACTED CONTACT & LINKS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {confirmedProfile.contact_info.email && (
                <span className="tag tag-info" style={{ fontSize: '0.8rem' }}>✉️ {confirmedProfile.contact_info.email}</span>
              )}
              {confirmedProfile.contact_info.phone && (
                <span className="tag tag-info" style={{ fontSize: '0.8rem' }}>☎️ {confirmedProfile.contact_info.phone}</span>
              )}
              {confirmedProfile.contact_info.linkedin_url ? (
                <span className="tag tag-success" style={{ fontSize: '0.8rem' }}>🔗 LinkedIn Verified</span>
              ) : (
                <span className="tag tag-warning" style={{ fontSize: '0.8rem' }}>⚠️ LinkedIn Missing</span>
              )}
              {confirmedProfile.contact_info.github_url ? (
                <span className="tag tag-success" style={{ fontSize: '0.8rem' }}>🐙 GitHub Verified</span>
              ) : (
                <span className="tag tag-info" style={{ fontSize: '0.8rem' }}>GitHub (Optional)</span>
              )}
            </div>

            {isEditingMissingInfo && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Full Name</label>
                    <input
                      className="form-input"
                      value={confirmedProfile.contact_info.full_name}
                      onChange={(e) => setConfirmedProfile({
                        ...confirmedProfile,
                        contact_info: { ...confirmedProfile.contact_info, full_name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Location (City, State)</label>
                    <input
                      className="form-input"
                      value={confirmedProfile.contact_info.location}
                      placeholder="e.g. Ranchi, Jharkhand"
                      onChange={(e) => setConfirmedProfile({
                        ...confirmedProfile,
                        contact_info: { ...confirmedProfile.contact_info, location: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>LinkedIn Profile URL</label>
                    <input
                      className="form-input"
                      value={confirmedProfile.contact_info.linkedin_url}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                      onChange={(e) => setConfirmedProfile({
                        ...confirmedProfile,
                        contact_info: { ...confirmedProfile.contact_info, linkedin_url: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>GitHub Profile URL (Optional)</label>
                    <input
                      className="form-input"
                      value={confirmedProfile.contact_info.github_url}
                      placeholder="https://github.com/yourusername"
                      onChange={(e) => setConfirmedProfile({
                        ...confirmedProfile,
                        contact_info: { ...confirmedProfile.contact_info, github_url: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Technical Skills (Verified from resume)</label>
                  <input
                    className="form-input"
                    value={confirmedProfile.skills.join(', ')}
                    onChange={(e) => setConfirmedProfile({
                      ...confirmedProfile,
                      skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* GENERATE IMPROVED ATS RESUME */}
          <div style={{ padding: '1.25rem', borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', border: '1px solid var(--primary-accent)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
              ✨ Improved ATS-Optimized Resume Draft
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Single-column, clean ATS format using verified facts from your resume. No fabricated metrics, employers, or qualifications.
            </p>

            {improvedResumeData ? (
              <div>
                <textarea
                  className="form-textarea"
                  style={{
                    width: '100%',
                    height: 220,
                    background: 'rgba(10, 13, 20, 0.9)',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    padding: '0.8rem',
                    borderRadius: 8,
                    marginBottom: '1rem'
                  }}
                  value={improvedTextContent}
                  onChange={(e) => handleSaveTextChanges(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        await api.resume.downloadPdf(improvedTextContent);
                      } catch (err) {
                        alert(err.message);
                      }
                    }}
                  >
                    📥 Download ATS Resume PDF
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(improvedTextContent);
                      alert('Copied improved ATS resume text to clipboard!');
                    }}
                  >
                    📋 Copy Text
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleGenerateImprovedResume}
                    disabled={isGeneratingImproved}
                  >
                    {isGeneratingImproved ? 'Regenerating...' : '🔄 Regenerate Draft'}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn-primary" onClick={handleGenerateImprovedResume} disabled={isGeneratingImproved}>
                {isGeneratingImproved ? 'Generating ATS Draft...' : '✨ Generate & Preview Improved ATS Resume'}
              </button>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {validationError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>⚠️ {validationError}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  onClick={handleContinueAfterResumeReview}
                  disabled={loading}
                >
                  🔄 Retry
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(4)} disabled={loading}>← Back to Resume Upload</button>
              <button className="btn-primary" onClick={handleContinueAfterResumeReview} disabled={loading}>
                {loading ? 'Processing...' : 'Continue to Next Workflow Stage →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: CAREER MATCH RESULTS & TARGET ROLE / COMPANY SELECTION (Path 2 & Path 3) */}
      {step === 5 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>
            {selectedPath === 'path2' ? '📊 Candidate Role Match Scores' : '💡 AI Recommended Career Roles'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {selectedPath === 'path2'
              ? 'Here is how your verified resume competencies align with the candidate roles under your consideration:'
              : 'Based on your resume and career assessment, here are recommended target roles with match percentages:'}
          </p>

          {/* MATCHED ROLES CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {roleMatches.map((m) => {
              const isSelected = selectedFinalRole === m.role_name;
              return (
                <div
                  key={m.role_name}
                  className="glass-card"
                  onClick={() => {
                    setSelectedFinalRole(m.role_name);
                    setValidationError('');
                  }}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    margin: 0,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(10, 13, 20, 0.4)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{m.role_name}</h4>
                      {isSelected && <span className="tag tag-success" style={{ fontSize: '0.75rem' }}>Selected</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Matching Skills: {m.matching_skills.join(', ')} • Key Focus Gap: <span style={{ color: '#fbbf24' }}>{m.key_gap}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-glow)' }}>{m.match_percentage}%</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evidence Match</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TARGET ROLE & OPTIONAL COMPANY CONFIRMATION FORM */}
          <div style={{ padding: '1.5rem', borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary-accent)', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>
              🎯 Confirm Final Target Role & Optional Target Company
            </h4>

            <div className="form-group">
              <label className="form-label">Select Target Role to Confirm <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                className="form-select"
                value={selectedFinalRole}
                onChange={(e) => {
                  setSelectedFinalRole(e.target.value);
                  setValidationError('');
                }}
              >
                <option value="">-- Choose One Target Role --</option>
                {roleMatches.map((m) => (
                  <option key={m.role_name} value={m.role_name}>
                    {m.role_name} ({m.match_percentage}% Match)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Company (OPTIONAL PREFERENCE)</label>
              <input
                className="form-input"
                placeholder="e.g. Google, Microsoft, Amazon (Leave blank if not specified)"
                value={finalTargetCompany}
                onChange={(e) => setFinalTargetCompany(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Used only for tailoring recommendations; will not be listed as prior employment.
              </span>
            </div>

            {validationError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.88rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>⚠️ {validationError}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  onClick={handleConfirmFinalRole}
                  disabled={loading}
                >
                  🔄 Retry
                </button>
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', fontSize: '1rem' }}
              onClick={handleConfirmFinalRole}
              disabled={loading || !selectedFinalRole}
            >
              {loading ? 'Confirming & Analyzing Skill Gap...' : 'Confirm Target Role & Proceed to Skill Gap Analysis →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
