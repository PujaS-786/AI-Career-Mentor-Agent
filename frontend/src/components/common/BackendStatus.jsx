/**
 * BackendStatus.jsx — Integration test component (Step 4)
 *
 * Calls GET /api/v1/health through the api service layer and
 * displays the result.  This component exists only to confirm
 * the React ↔ Flask connection is working.
 *
 * It will be replaced by real dashboard components in later steps.
 */
import { useState, useEffect } from 'react';
import api from '@/services/api';
import './BackendStatus.css';

function BackendStatus() {
  // Possible states: 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Call the Flask health endpoint when this component mounts
    api.get('/health')
      .then((json) => {
        setData(json);
        setStatus('success');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Unknown error');
        setStatus('error');
      });
  }, []); // Empty dependency array → runs once on mount

  return (
    <div className="backend-status">
      <h2 className="bs-title">Backend Connection</h2>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="bs-row bs-loading">
          <span className="bs-spinner" />
          <span>Connecting to Flask API…</span>
        </div>
      )}

      {/* Success state */}
      {status === 'success' && (
        <div className="bs-row bs-success">
          <span className="bs-icon">✓</span>
          <div className="bs-info">
            <p className="bs-label">Flask responded successfully</p>
            <p className="bs-message">{data?.message}</p>
            <code className="bs-json">{JSON.stringify(data, null, 2)}</code>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="bs-row bs-error">
          <span className="bs-icon">✗</span>
          <div className="bs-info">
            <p className="bs-label">Could not reach Flask backend</p>
            <p className="bs-message">{errorMsg}</p>
            <p className="bs-hint">Make sure the Flask server is running on port 5000.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackendStatus;
