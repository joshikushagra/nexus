"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Step 1: Generate mock token (replace with real Firebase auth in production)
      const token = `mock_${email}`;

      // Step 2: Verify user exists in DB AND has the 'founder' role
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error("Account not found. Please contact your administrator.");
      }

      if (data.data?.role !== "founder") {
        throw new Error("Access denied. This portal is for administrators only.");
      }

      // Step 3: Persist token & user name
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_name", data.data.name || "Admin");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left — Brand panel */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content fade-in">
          <div className="auth-brand-mark">NX</div>
          <div className="auth-tagline">The command center for your team</div>
          <div className="auth-desc">
            Manage clients, assign tasks, monitor activity and keep your team in sync — all in one place.
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">👥</div>
              Role-based access control for your entire team
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📊</div>
              Real-time dashboard with KPIs and metrics
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔒</div>
              Secure audit logs for every action taken
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-right">
        <div className="auth-form-card fade-in">
          <div className="auth-form-title">Admin Sign In</div>
          <div className="auth-form-subtitle">Restricted to authorized administrators only</div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="email">
                Email address <span className="field-required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">
                Password <span className="field-required">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? <div className="spinner" /> : null}
              {loading ? "Verifying…" : "Sign in to Admin Panel"}
            </button>
          </form>

          <p style={{ marginTop: "24px", fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center" }}>
            Not an admin?{" "}
            <a href="http://localhost:3000" style={{ color: "var(--brand-400)", textDecoration: "none", fontWeight: 600 }}>
              Go to User Portal →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
