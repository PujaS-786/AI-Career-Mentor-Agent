import React, { useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

export default function ProfileSettingsModal({ isOpen, onClose, user, onUpdateUser, onLogout }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    college: user?.college || '',
    degree: user?.degree || '',
    graduation_year: user?.graduation_year || 2026,
    target_role: user?.target_role || '',
    target_company: user?.target_company || '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        college: user.college || '',
        degree: user.degree || '',
        graduation_year: user.graduation_year || 2026,
        target_role: user.target_role || '',
        target_company: user.target_company || '',
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.auth.updateProfile(formData);
      if (formData.target_role) {
        await api.roles.select(formData.target_role, formData.target_company);
      }
      onUpdateUser(res.user || { ...user, ...formData });
      setMsg('Profile updated successfully!');
      setTimeout(() => {
        setMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      alert(`Error saving profile: ${err.message}`);
    }
  };

  const handleLogoutClick = () => {
    setAuthToken('');
    onLogout();
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div className="glass-card" style={{ width: 480, padding: '2rem', position: 'relative' }}>
        <button style={closeStyle} onClick={onClose}>✕</button>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>👤 Profile & Settings</h2>

        {msg && <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem' }}>{msg}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" name="full_name" value={formData.full_name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">College / University</label>
            <input className="form-input" name="college" value={formData.college} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Degree / Course</label>
              <input className="form-input" name="degree" value={formData.degree} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input className="form-input" type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input className="form-input" name="target_role" value={formData.target_role} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Company</label>
              <input className="form-input" name="target_company" value={formData.target_company} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }} onClick={handleLogoutClick}>
              🚪 Log Out
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 300,
};

const closeStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '1.2rem',
  cursor: 'pointer',
};
