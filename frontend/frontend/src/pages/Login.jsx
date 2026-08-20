import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  FileText,
} from "lucide-react";

import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Please enter your college email.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    /*
      Backend authentication will be connected here.

      Future flow:

      React
        ↓
      FastAPI /login
        ↓
      Verify hashed password
        ↓
      Generate JWT
        ↓
      Store authentication state
        ↓
      Navigate to dashboard
    */

    setError(
      "Login UI is ready. FastAPI authentication will be connected next."
    );
  };

  return (
    <div className="auth-page">
      {/* Background glow */}
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-container">

        {/* =========================
            LEFT SHOWCASE
        ========================== */}

        <section className="auth-showcase">
          <div className="showcase-content">

            <div className="brand-badge">
              <div className="brand-icon">
                <GraduationCap size={21} />
              </div>

              <div>
                <strong>AI ECMS</strong>
                <span>College Content AI</span>
              </div>
            </div>

            <div className="showcase-heading">

              <div className="ai-pill">
                <Sparkles size={15} />
                Intelligent College Content
              </div>

              <h1>
                Welcome back to your
                <span> AI workspace.</span>
              </h1>

              <p>
                Access your college documents, AI assistant,
                insights and intelligent content tools from one
                secure workspace.
              </p>

            </div>

            <div className="feature-stack">

              <div className="feature-card">
                <div className="feature-icon">
                  <BrainCircuit size={20} />
                </div>

                <div>
                  <h3>AI Document Intelligence</h3>
                  <p>
                    Analyze real college documents using AI.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FileText size={20} />
                </div>

                <div>
                  <h3>College Knowledge Hub</h3>
                  <p>
                    Search and understand academic content easily.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3>Secure AI Workspace</h3>
                  <p>
                    Your documents and workspace stay user-specific.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================
            LOGIN FORM
        ========================== */}

        <section className="auth-form-section">

          <div className="auth-card">

            <div className="auth-card-header">

              <div className="mobile-brand">
                <div className="mobile-brand-icon">
                  <GraduationCap size={20} />
                </div>

                <span>AI ECMS</span>
              </div>

              <div className="auth-title-icon">
                <LogIn size={22} />
              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in to continue to your AI workspace.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  College Email
                </label>

                <div className="input-wrapper">

                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="form-group">

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setError(
                        "Password recovery will be connected with the authentication backend."
                      )
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#fb7185",
                      fontSize: "10px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="input-wrapper">

                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="auth-message">
                  <span></span>
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="auth-submit"
              >
                <span>Sign In</span>
                <LogIn size={18} />
              </button>

              {/* SECURITY */}

              <div className="auth-security">

                <ShieldCheck size={16} />

                <span>
                  Secure authentication powered by AI ECMS.
                </span>

              </div>

            </form>

            {/* REGISTER */}

            <div className="auth-divider">
              <span>Don't have an account?</span>
            </div>

            <button
              type="button"
              className="login-link-button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create an AI ECMS Account
            </button>

            <p className="auth-footer">
              AI-Based Enterprise Content Management System
            </p>

          </div>

        </section>

      </div>
    </div>
  );
};

export default Login;