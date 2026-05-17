import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { backendFetch } from "../utils/api";
import "./Auth.css";

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await backendFetch('/api/auth/signup', {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      if (!response) {
        throw new Error("No response from server");
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError, response);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (response.ok) {
        setSuccessMessage("Signup successful! Please sign in to continue.");
        setErrorMessage("");
        setTimeout(() => navigate("/signin", { replace: true }), 800);
        return;
      }
      setErrorMessage(data.error || "Signup failed");
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us and start your health journey today</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="input-group">
              <span className="input-icon">👤</span>
              <input
                name="name"
                type="text"
                placeholder="Full name"
                onChange={handleChange}
                required
              />
            </label>

            <label className="input-group">
              <span className="input-icon">✉️</span>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                onChange={handleChange}
                required
              />
            </label>

            <label className="input-group">
              <span className="input-icon">🔒</span>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </label>

            <label className="auth-checkbox-row">
              <input type="checkbox" required />
              <span>
                I agree to the <Link to="/privacy">Terms & Privacy Policy</Link>
              </span>
            </label>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          {successMessage && <p className="auth-success">{successMessage}</p>}
          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/signin">Sign In here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
