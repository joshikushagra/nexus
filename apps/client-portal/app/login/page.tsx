"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin]   = useState(true);
  const [role, setRole]         = useState<"client" | "developer">("client");
  const [email, setEmail]       = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const token = `mock_${email}`;
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

      if (!isLogin) {
        // Sign up
        const res = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ name, email, role, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create account");
      } else {
        // Log in
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Account not found. Please sign up.");
        // Override role if it exists in DB
        if (data.data?.role) {
          setRole(data.data.role);
          localStorage.setItem("user_role", data.data.role);
        }
        if (data.data?.name) {
          localStorage.setItem("user_name", data.data.name);
        }
      }

      localStorage.setItem("client_token", token);
      localStorage.setItem("user_role", role);
      if (!isLogin) localStorage.setItem("user_name", name);
      // Redirect to main app based on role (role is already updated in localStorage above)
      const finalRole = localStorage.getItem("user_role") || role;
      if (finalRole === "developer") {
        router.push("/developer");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left brand panel */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content fade-in">
          <div className="auth-brand-mark">NX</div>
          <div className="auth-tagline">Your projects, your way</div>
          <div className="auth-desc">
            Browse opportunities, manage clients, engage with the community — everything in one beautiful portal.
          </div>
          <div className="auth-features">
            <div className="auth-feature"><div className="auth-feature-icon">💼</div>Discover and post high-quality work</div>
            <div className="auth-feature"><div className="auth-feature-icon">👥</div>Manage your entire client or developer base</div>
            <div className="auth-feature"><div className="auth-feature-icon">💬</div>Connect with peers in the community forum</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-form-card fade-in">
          <div className="auth-form-title">{isLogin ? "Sign in to Nexus" : "Create an account"}</div>
          <div className="auth-form-subtitle">
            {isLogin ? "Enter your credentials to access your portal" : "Join us to manage projects and connect"}
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <button 
              type="button" 
              onClick={() => setRole("client")}
              style={{ flex: 1, padding: "8px 0", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s", background: role === "client" ? "rgba(99,102,241,0.15)" : "transparent", color: role === "client" ? "var(--brand-400)" : "var(--text-secondary)" }}
            >
              I'm a Client
            </button>
            <button 
              type="button" 
              onClick={() => setRole("developer")}
              style={{ flex: 1, padding: "8px 0", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s", background: role === "developer" ? "rgba(99,102,241,0.15)" : "transparent", color: role === "developer" ? "var(--brand-400)" : "var(--text-secondary)" }}
            >
              I'm a Developer
            </button>
          </div>

          <form onSubmit={onSubmit}>
            {!isLogin && (
              <div className="field">
                <label className="field-label" htmlFor="name">Full Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
              </div>
            )}
            <div className="field">
              <label className="field-label" htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••••••" required />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <div className="spinner" /> : null}
              {loading ? (isLogin ? "Signing in…" : "Creating account…") : (isLogin ? "Sign In to Portal" : "Create Account")}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13.5, color: "var(--text-tertiary)", textAlign: "center" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ background: "none", border: "none", color: "var(--brand-400)", fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
