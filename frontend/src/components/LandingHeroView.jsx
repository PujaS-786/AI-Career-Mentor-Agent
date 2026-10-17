import React from 'react';

export default function LandingHeroView({ onStartOnboarding, onOpenAuth }) {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '1rem 0' }}>
      {/* HERO BANNER */}
      <div className="hero-banner glass-card" style={{ padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <span className="tag tag-success" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          ⚡ AI-Powered Career Development & Interview Suite
        </span>
        <h1 className="hero-title" style={{ fontSize: '3rem', fontWeight: 900 }}>
          AI Career Mentor Agent
        </h1>
        <p className="hero-subtitle">
          Your personal AI career mentor — guiding you from role decision, resume analysis, and skill gap discovery to a personalized roadmap, learning resources, and voice/camera mock interviews.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }} onClick={onStartOnboarding}>
            🚀 Start Career Onboarding Journey
          </button>
          <button className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }} onClick={onOpenAuth}>
            🔑 Student Sign In / Register
          </button>
        </div>
      </div>

      {/* 3 ONBOARDING PATHS CARDS */}
      <div id="career-paths">
        <h3 style={{ fontSize: '1.5rem', color: '#fff', textAlign: 'center', margin: '2.5rem 0 1.5rem 0' }}>
          Choose Your Personalized Career Path
        </h3>

        <div className="grid-3">
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary-accent)' }}>
            <span className="tag tag-success" style={{ marginBottom: '0.8rem' }}>Path 1</span>
            <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Target Role Decided</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Already know your target role (e.g. Software Developer at Google)? Jump straight into assessment, resume analysis, skill gaps, and your custom roadmap.
            </p>
          </div>

          <div className="glass-card" style={{ borderTop: '4px solid #34d399' }}>
            <span className="tag tag-warning" style={{ marginBottom: '0.8rem' }}>Path 2</span>
            <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>A Few Roles in Mind</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Considering 2–4 roles? Compare your skill profile across candidate roles with estimated career-match percentages before choosing your final role.
            </p>
          </div>

          <div className="glass-card" style={{ borderTop: '4px solid #fbbf24' }}>
            <span className="tag tag-info" style={{ marginBottom: '0.8rem' }}>Path 3</span>
            <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Role Not Decided Yet</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Unsure where to start? Our AI analysis agent evaluates your interests and background to recommend the best matching career roles.
            </p>
          </div>
        </div>
      </div>

      {/* 5 AI AGENTS ARCHITECTURE HIGHLIGHTS */}
      <div id="ai-agents" className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          🤖 Powered by 5 Specialized AI Agents
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>1. Orchestrator Agent</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Central workflow coordination & multi-agent pipeline orchestration</span>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>2. Resume Analysis Agent</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resume validation, ATS scoring, profile extraction & improvement drafting</span>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>3. Skill Gap Agent</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Existing, weak, missing skills analysis & candidate role matching</span>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>4. Roadmap Agent</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personalized milestone learning paths, projects & certifications</span>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>5. Mock Interview Agent</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adaptive question generation, answer scoring & detailed feedback</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div id="how-it-works" className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          🔄 How It Works
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          A step-by-step AI-guided workflow designed to prepare candidates for their dream roles:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { step: '1', title: 'Create Account', desc: 'Register securely with password hashing and JWT authentication.' },
            { step: '2', title: 'Choose Career Path', desc: 'Select from 3 personalized career path onboarding options.' },
            { step: '3', title: 'Career Assessment', desc: 'Share your background, current skills, and career goals.' },
            { step: '4', title: 'Resume Upload & Validation', desc: 'Upload your resume PDF/DOCX for instant text extraction & format checks.' },
            { step: '5', title: 'Resume Analysis & Improvement', desc: 'Get ATS score diagnostics and generate/download an improved resume PDF.' },
            { step: '6', title: 'Role Matching & Recommendations', desc: 'Compare role match percentages or receive AI career role suggestions.' },
            { step: '7', title: 'Confirm Target Role', desc: 'Set your definitive target role and target company.' },
            { step: '8', title: 'Skill Gap Analysis', desc: 'Identify existing, weak, and missing technical capabilities.' },
            { step: '9', title: 'Personalized Roadmap', desc: 'Follow custom milestone learning plans, curated resources, and projects.' },
            { step: '10', title: 'AI Mock Interview & Analytics', desc: 'Practice simulated interviews with Gemini scoring and progress tracking.' }
          ].map((s) => (
            <div key={s.step} style={{ padding: '0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <span className="tag tag-info" style={{ fontSize: '0.75rem', marginBottom: 6 }}>Step {s.step}</span>
              <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem', margin: '4px 0' }}>{s.title}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WHY AI CAREER MENTOR AGENT SECTION */}
      <div id="why-us" className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          ⭐ Why AI Career Mentor Agent?
        </h3>
        <div className="grid-2">
          <div style={{ padding: '0.9rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>🎯 Tailored Guidance</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Personalized roadmap and skill gap evaluation specific to your exact target role and company.</p>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>📄 ATS Resume PDF Generation</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generate ATS-optimized resume drafts and download clean PDFs built dynamically from your user data.</p>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>🎙️ AI-Powered Mock Interviews</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Simulated technical and behavioral interviews powered by Gemini AI with objective scoring and feedback.</p>
          </div>
          <div style={{ padding: '0.9rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>📊 Complete Data Isolation & Persistence</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your data is securely isolated and permanently available whenever you log back into your account.</p>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div id="features" className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          ✨ Platform Features
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
          {[
            'Career Assessment', 'Resume Analysis & ATS Scoring', 'Resume Improvement & PDF Download',
            'Candidate Role Matching', 'AI Career Recommendations', 'Skill Gap Analysis',
            'Personalized Roadmap', 'Practice Projects & Certifications', 'AI Mock Interview Suite',
            'Progress & Analytics Dashboard', '24/7 AI Career Mentor'
          ].map((feat, idx) => (
            <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(10, 13, 20, 0.5)', borderRadius: 8, border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.88rem', fontWeight: 500 }}>
              ✓ {feat}
            </div>
          ))}
        </div>
      </div>

      {/* WHO CAN USE IT SECTION */}
      <div id="who-can-use" className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          👥 Who Can Use AI Career Mentor Agent?
        </h3>
        <div className="grid-3">
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🎓</div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>College Students</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Preparing for campus placements and internship interviews.</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🚀</div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>Fresh Graduates & Job Seekers</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Looking to transition smoothly into their target industry roles.</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🔍</div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>Career Explorers</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Students comparing technical career paths to discover their best fit.</span>
          </div>
        </div>
      </div>

      {/* HOME PAGE FOOTER */}
      <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem' }}
          >
            How It Works
          </a>
          <a
            href="#why-us"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem' }}
          >
            Why Us
          </a>
          <a
            href="#career-paths"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('career-paths')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem' }}
          >
            Career Paths
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem' }}
          >
            Features
          </a>
          <a
            href="#ai-agents"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('ai-agents')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem' }}
          >
            AI Agents
          </a>
          <a
            href="#who-can-use"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('who-can-use')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem' }}
          >
            Who Can Use It
          </a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © AI Career Mentor Agent — Professional AI Career Development Platform.
        </p>
      </footer>
    </div>
  );
}
