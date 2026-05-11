import { useState } from 'react';
import { Link } from 'react-router-dom';
import "./Auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetLink('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data = {};
      let text = '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        text = await response.text();
      }

      if (response.ok) {
        setSubmitted(true);
        setResetLink(data.resetLink || '');
        alert(data.message || 'Check your email for the reset link!');
      } else {
        if (response.status === 429) {
          alert(data.error || text || 'Too many password reset attempts. Please wait and try again.');
        } else {
          alert(data.error || text || `Request failed (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
          <p className="auth-subtitle">Enter your email to receive a password reset link</p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="input-group">
                <span className="input-icon">✉️</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="auth-form">
              <p style={{ textAlign: 'center', color: '#4f6481', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                ✅ Email sent successfully!
              </p>
              <p style={{ textAlign: 'center', color: '#556c87', marginBottom: '1rem' }}>
                Check your inbox for a password reset link. It will expire in 15 minutes.
              </p>
              {resetLink && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#eef6ff', borderRadius: '12px' }}>
                  <p style={{ color: '#0d3b66', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    Development reset link:
                  </p>
                  <a href={resetLink} style={{ color: '#1f66d0', wordBreak: 'break-all' }}>
                    {resetLink}
                  </a>
                </div>
              )}
              <p style={{ textAlign: 'center', color: '#8fa9c4', fontSize: '0.9rem', marginTop: '1rem' }}>
                Didn't receive it? Check your spam folder or try again.
              </p>
            </div>
          )}

          <div className="auth-footer">
            <p>Remember your password? <Link to="/signin">Sign In here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
