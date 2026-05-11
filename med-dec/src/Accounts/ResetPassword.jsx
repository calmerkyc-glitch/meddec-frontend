import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './Auth.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!token) {
      setStatusMessage('Reset token is missing from the URL.');
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage('Passwords must match.');
      return;
    }

    if (password.length < 8) {
      setStatusMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 1800);
      } else {
        setStatusMessage(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const message = err?.message || '';
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        setStatusMessage('Unable to reach the backend at http://localhost:5000. Make sure the backend server is running.');
      } else {
        setStatusMessage(message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="auth-brand-name">MedDec</div>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Create a new password for your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="input-group">
              <span className="input-icon">🔒</span>
              <input
                name="password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className="input-group">
              <span className="input-icon">🔒</span>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            {statusMessage && (
              <p style={{ color: '#1f3d5f', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {statusMessage}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Remembered it? <Link to="/signin">Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
