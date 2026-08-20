import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  FileText,
} from "lucide-react";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
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

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    /*
      Authentication backend is not connected yet.

      We intentionally do NOT create fake authentication here.
      This form will be connected to FastAPI in the next stage.
    */

    setError(
      "Registration UI is ready. Backend authentication will be connected next."
    );
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-container">
        {/* LEFT SIDE */}
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
                AI-Powered College Intelligence
              </div>

              <h1>
                Your college
                <span> knowledge,</span>
                <br />
                intelligently organized.
              </h1>

              <p>
                Upload, understand, search and analyze college documents
                using a powerful AI-driven content intelligence system.
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
                    Understand academic documents with AI-powered analysis.
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
                    Keep regulations, notices and academic content organized.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3>Grounded AI Answers</h3>
                  <p>
                    Ask questions and receive answers based on real documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
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
                <User size={22} />
              </div>

              <h2>Create your account</h2>

              <p>
                Join your college's intelligent content workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>

                <div className="input-wrapper">
                  <User size={18} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">College Email</label>

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

              {/* Role */}
              <div className="form-group">
                <label htmlFor="role">Account Type</label>

                <div className="input-wrapper">
                  <GraduationCap size={18} />

                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="input-wrapper">
                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
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

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div className="input-wrapper">
                  <Lock size={18} />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-message">
                  <span></span>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit">
                <span>Create Account</span>
                <ArrowRight size={18} />
              </button>

              <div className="auth-security">
                <ShieldCheck size={16} />
                <span>Your account will be securely authenticated.</span>
              </div>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <button
              type="button"
              className="login-link-button"
              onClick={() => navigate("/login")}
            >
              Sign in to AI ECMS
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

export default Register;