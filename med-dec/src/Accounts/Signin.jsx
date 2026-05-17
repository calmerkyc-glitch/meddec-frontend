import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { backendFetch } from "../utils/api";
import "./Auth.css";

function Signin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await backendFetch('/api/auth/signin', {
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
        login(data.token, data.user || { email: formData.email });
        setSuccessMessage("Signin successful! Redirecting...");
        
        // Redirect based on user role
        const userRole = data.user?.role;
        let redirectPath = "/dashboard"; // default for patients
        
        if (userRole === "admin") {
          redirectPath = "/admin";
        } else if (userRole === "pharmacy") {
          redirectPath = "/pharmacy";
        } else if (userRole === "logistics") {
          redirectPath = "/logistics";
        }
        
        setTimeout(() => navigate(redirectPath, { replace: true }), 500);
        return;
      }

      setErrorMessage(data.error || "Signin failed");
    } catch (err) {
      console.error("Signin error:", err);
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
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back! Please sign in to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="input-group">
              <span className="input-icon">✉️</span>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
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
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {successMessage && <p className="auth-success">{successMessage}</p>}
          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <div className="auth-footer">
            <p>Don'\''t have an account? <Link to="/signup">Sign Up here</Link></p>
            <p>Forgot your password? <Link to="/forgot-password">Reset here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
