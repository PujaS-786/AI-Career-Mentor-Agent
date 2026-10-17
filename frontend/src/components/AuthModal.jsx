import React, { useState } from 'react';
import api, { setAuthToken } from '../services/api';

function PasswordField({ label, name, value, onChange, placeholder, required = true }) {
  const [show, setShow] = useState(false);

  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{ paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialView = 'register' }) {
  const [view, setView] = useState(initialView); // 'register', 'login', 'forgot_email', 'forgot_reset', 'forgot_success'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    college: '',
    degree: '',
    graduation_year: 2026,
  });

  const [resetData, setResetData] = useState({
    email: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (typeof isOpen === 'string' && (isOpen === 'register' || isOpen === 'login')) {
        setView(isOpen);
      } else if (initialView) {
        setView(initialView);
      }
    }
  }, [isOpen, initialView]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setView('forgot_reset');
    }
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (view === 'register') {
      if (!formData.full_name.trim()) {
        setError('Full name is required.');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email address is required.');
        return;
      }
      if (!formData.password) {
        setError('Password is required.');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      let res;
      if (view === 'register') {
        const { confirm_password, ...registerPayload } = formData;
        res = await api.auth.register(registerPayload);
      } else {
        res = await api.auth.login({ email: formData.email, password: formData.password });
      }

      if (res && res.user && res.token) {
        setAuthToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        throw new Error('Authentication failed. Invalid response from server.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!resetData.email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(resetData.email.trim());
      setSuccessMessage(res.message || `Password reset link has been sent to ${resetData.email}.`);
      setView('forgot_sent');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetData.new_password) {
      setError('New password is required.');
      return;
    }

    if (resetData.new_password !== resetData.confirm_new_password) {
      setError('Passwords do not match.');
      return;
    }

    const tokenToUse = resetToken || resetData.token;
    if (!tokenToUse) {
      setError('Reset token is missing. Please click the reset link in your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.resetPassword(tokenToUse, resetData.new_password);
      setSuccessMessage(res.message || 'Password reset successfully!');
      setView('forgot_success');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="glass-card auth-modal-card">
        <button style={closeBtnStyle} onClick={onClose} aria-label="Close modal">✕</button>

        {/* TOP TAB SWITCHER (For Register & Login Views) */}
        {(view === 'register' || view === 'login') && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${view === 'register' ? 'active' : ''}`}
              onClick={() => { setError(''); setView('register'); }}
            >
              ✨ Register
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${view === 'login' ? 'active' : ''}`}
              onClick={() => { setError(''); setView('login'); }}
            >
              🔑 Log In
            </button>
          </div>
        )}

        {/* ERROR ALERT */}
        {error && (
          <div style={{ padding: '0.6rem 0.8rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* 1. REGISTER VIEW */}
        {view === 'register' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Student Registration</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create your career mentor account to get started.</p>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="e.g. Alex Rivera" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@university.edu" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <PasswordField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={true}
                  placeholder="••••••••"
                />
                <PasswordField
                  label="Confirm Password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required={true}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">College / University</label>
                <input className="form-input" name="college" value={formData.college} onChange={handleChange} placeholder="e.g. Stanford University" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Degree / Course</label>
                  <input className="form-input" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. B.S. Computer Science" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Graduation Year</label>
                  <input className="form-input" type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="2026" />
                </div>
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }} disabled={loading}>
                {loading ? 'Registering & Directing to Onboarding...' : '🚀 Complete Registration & Start Onboarding'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <span style={{ color: 'var(--primary-glow)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setError(''); setView('login'); }}>
                Log in here
              </span>
            </div>
          </>
        )}

        {/* 2. LOGIN VIEW */}
        {view === 'login' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Student Login</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Welcome back! Sign in to continue your career journey.</p>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@university.edu" />
              </div>

              <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={true}
                placeholder="••••••••"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.25rem', marginBottom: '1.25rem' }}>
                <span
                  style={{ color: 'var(--primary-glow)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => {
                    setError('');
                    setResetData((prev) => ({ ...prev, email: formData.email }));
                    setView('forgot_email');
                  }}
                >
                  Forgot Password?
                </span>
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }} disabled={loading}>
                {loading ? 'Signing In...' : '🔑 Sign In & Proceed to Onboarding'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have an account yet?{' '}
              <span style={{ color: 'var(--primary-glow)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setError(''); setView('register'); }}>
                Register now
              </span>
            </div>
          </>
        )}

        {/* 3. FORGOT PASSWORD — STEP 1: EMAIL */}
        {view === 'forgot_email' && (
          <>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>Reset Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Enter your registered email address to receive a secure password reset link.
            </p>

            <form onSubmit={handleForgotEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  placeholder="e.g. alex.rivera@university.edu"
                  required
                />
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Sending Reset Email...' : 'Send Password Reset Link →'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--primary-glow)', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setError(''); setView('login'); }}>
                ← Return to Login
              </span>
            </div>
          </>
        )}

        {/* 3.5. FORGOT PASSWORD SENT VIEW */}
        {view === 'forgot_sent' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Password Reset Email Sent</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              {successMessage || `A reset link has been dispatched to ${resetData.email}. Please open the link in your email to reset your password.`}
            </p>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={() => {
                setError('');
                setView('login');
              }}
            >
              Return to Login →
            </button>
          </div>
        )}

        {/* 4. FORGOT PASSWORD — STEP 2: NEW PASSWORD */}
        {view === 'forgot_reset' && (
          <>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>Set New Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Enter a new password for your account.
            </p>

            <form onSubmit={handleForgotResetSubmit}>
              <PasswordField
                label="New Password"
                name="new_password"
                value={resetData.new_password}
                onChange={handleResetChange}
                required={true}
              />

              <PasswordField
                label="Confirm New Password"
                name="confirm_new_password"
                value={resetData.confirm_new_password}
                onChange={handleResetChange}
                required={true}
              />

              <button className="btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--primary-glow)', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setError(''); setView('login'); }}>
                ← Return to Login
              </span>
            </div>
          </>
        )}

        {/* 5. FORGOT PASSWORD — STEP 3: SUCCESS */}
        {view === 'forgot_success' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Password Reset Successful</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Your password has been updated in the database. You can now log in with your new password.
            </p>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={() => {
                setError('');
                setView('login');
              }}
            >
              Return to Login →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 300,
};

const closeBtnStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '1.2rem',
  cursor: 'pointer',
  zIndex: 10,
};

