import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import BrandMark from "../shared/BrandMark";
import api from "../../utils/api";
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signupSuccess = Boolean(location.state?.signupSuccess);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/login", { email, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <BrandMark />
        </div>

        <h1 className="auth-title">Sign in to CodeForge</h1>

        <div className="auth-box">
          {signupSuccess && (
            <div className="success-message" style={{ marginBottom: 16 }}>
              Account created successfully. Please sign in.
            </div>
          )}
          {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
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
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "9px 16px" }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{ borderWidth: 2, width: 16, height: 16 }} /> Signing in...</> : "Sign in"}
            </button>
          </form>
        </div>

        <div className="auth-footer-box">
          New to CodeForge?{" "}
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
