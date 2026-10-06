import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MarkGithubIcon } from "@primer/octicons-react";
import api from "../../utils/api";
import "./auth.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, hyphens and underscores.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/signup", { username, email, password });
      navigate("/auth", { state: { signupSuccess: true } });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <MarkGithubIcon size={48} />
        </div>

        <h1 className="auth-title">Create your account</h1>

        <div className="auth-box">
          {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                autoComplete="username"
                required
              />
              <span className="form-hint">Letters, numbers, hyphens & underscores only.</span>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "9px 16px" }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{ borderWidth: 2, width: 16, height: 16 }} /> Creating account...</> : "Create account"}
            </button>
          </form>
        </div>

        <div className="auth-footer-box">
          Already have an account?{" "}
          <Link to="/auth">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
