"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Project = {
  _id: string;
  title: string;
  description: string;
  projectType: string;
  status: string;
  progress: number;
  progressNotes: string;
  githubRepoUrl: string;
  teamMembers: string[];
  createdAt: string;
};

const progressColor = (p: number) =>
  p === 100 ? "#10b981" : p >= 60 ? "#6366f1" : p >= 30 ? "#f59e0b" : "#ef4444";

export default function DeveloperDashboard() {
  const [projects, setProjects]           = useState<Project[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [progressInputs, setProgressInputs] = useState<Record<string, { progress: number; progressNotes: string; githubRepoUrl: string }>>({});
  const [successMsg, setSuccessMsg]       = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || "mock-dev-token";
    fetch(`${API}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        const data: Project[] = j.data || [];
        setProjects(data);
        // Init input state per project
        const init: typeof progressInputs = {};
        data.forEach((p) => {
          init[p._id] = {
            progress: p.progress || 0,
            progressNotes: p.progressNotes || "",
            githubRepoUrl: p.githubRepoUrl || "",
          };
        });
        setProgressInputs(init);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (projectId: string) => {
    setUpdatingId(projectId);
    setSuccessMsg("");
    setError("");
    try {
      const token = localStorage.getItem("token") || "mock-dev-token";
      const body = progressInputs[projectId];
      const res = await fetch(`${API}/projects/${projectId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Update failed");
      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, ...json.data } : p))
      );
      setSuccessMsg(`✓ "${projects.find((p) => p._id === projectId)?.title}" updated!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const setField = (id: string, field: "progress" | "progressNotes" | "githubRepoUrl", val: string | number) => {
    setProgressInputs((prev) => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  return (
    <>
      <Navigation />
      <main>
        {/* ── Hero ─ GREEN accent for developer ── */}
        <div className="fade-in" style={{
          background: "linear-gradient(135deg, #061a12 0%, #0a1f18 100%)",
          borderRadius: "var(--r-xl)", padding: "40px 40px", marginBottom: 24,
          border: "1px solid rgba(16,185,129,0.18)", position: "relative", overflow: "hidden",
        }}>
          {/* Glow blob */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 280, height: 280, borderRadius: "50%", background: "rgba(16,185,129,0.09)", filter: "blur(60px)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white", boxShadow: "0 0 14px rgba(16,185,129,0.35)" }}>💻</div>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 9999, background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.25)", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
                Developer Workspace
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 6, letterSpacing: "-0.5px" }}>
              {typeof window !== "undefined" && localStorage.getItem("user_name")
                ? `Hey, ${localStorage.getItem("user_name")?.split(" ")[0]} 👋`
                : "Your Projects 👋"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, maxWidth: 500, lineHeight: 1.6, marginBottom: 22 }}>
              Update progress, link GitHub repos, and post status notes for each of your assigned projects.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/work" style={{ padding: "9px 20px", borderRadius: 9, background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 0 20px rgba(16,185,129,0.35)", display: "inline-block" }}>
                💼 Find Work
              </a>
              <a href="/forum" style={{ padding: "9px 20px", borderRadius: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block" }}>
                💬 Community Forum
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error fade-in" style={{ marginBottom: 16 }}>{error}</div>
        )}
        {successMsg && (
          <div className="alert alert-success fade-in" style={{ marginBottom: 16 }}>{successMsg}</div>
        )}

        {/* Stats */}
        <div className="stats-grid fade-in">
          {[
            { label: "Total Projects",   value: loading ? "—" : String(projects.length),                                    icon: "📂", color: "#6366f1" },
            { label: "Active",           value: loading ? "—" : String(projects.filter(p => p.status === "active").length), icon: "🚀", color: "#10b981" },
            { label: "Completed",        value: loading ? "—" : String(projects.filter(p => p.progress === 100).length),    icon: "✅", color: "#f59e0b" },
            { label: "Avg. Progress",    value: loading ? "—" : `${projects.length ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0}%`, icon: "📈", color: "#ec4899" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Project Cards */}
        {loading ? (
          <div className="card fade-in">
            <div className="empty-state">
              <div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} />
              <div>Loading projects…</div>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="card fade-in">
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No projects assigned yet.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map((proj) => {
              const input = progressInputs[proj._id] || { progress: 0, progressNotes: "", githubRepoUrl: "" };
              return (
                <div key={proj._id} className="card fade-in" style={{ margin: 0 }}>
                  {/* Project header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <Link href={`/projects/${proj._id}`} style={{ fontWeight: 700, fontSize: 16, color: "var(--brand-400)", textDecoration: "none" }}>{proj.title}</Link>
                      <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{proj.projectType}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge ${proj.status === "completed" ? "badge-brand" : "badge-success"}`}>{proj.status}</span>
                      <span style={{ fontWeight: 700, color: progressColor(proj.progress || 0), fontSize: 15 }}>{proj.progress || 0}%</span>
                    </div>
                  </div>

                  {/* Current progress bar */}
                  <div className="progress-bar-wrap" style={{ marginBottom: 20 }}>
                    <div className="progress-bar-fill" style={{ width: `${proj.progress || 0}%`, background: progressColor(proj.progress || 0) }} />
                  </div>

                  {proj.description && (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.55 }}>{proj.description}</div>
                  )}

                  {/* Update form */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-secondary)"}}>Update Progress</div>

                    {/* Progress slider */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: 700, color: progressColor(input.progress) }}>{input.progress}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={input.progress}
                        onChange={(e) => setField(proj._id, "progress", Number(e.target.value))}
                        style={{ width: "100%", accentColor: progressColor(input.progress) }}
                      />
                    </div>

                    {/* Notes */}
                    <textarea
                      className="input"
                      placeholder="Status update / notes (visible to client)…"
                      rows={2}
                      value={input.progressNotes}
                      onChange={(e) => setField(proj._id, "progressNotes", e.target.value)}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                    />

                    {/* GitHub repo link */}
                    <input
                      className="input"
                      placeholder="GitHub repo URL (e.g. https://github.com/org/repo)"
                      value={input.githubRepoUrl}
                      onChange={(e) => setField(proj._id, "githubRepoUrl", e.target.value)}
                    />

                    <button
                      className="btn btn-primary"
                      style={{ alignSelf: "flex-end" }}
                      onClick={() => handleUpdate(proj._id)}
                      disabled={updatingId === proj._id}
                    >
                      {updatingId === proj._id ? "Saving…" : "Save Update"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Developer Quick Access ── */}
        <div className="card fade-in">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Quick Access</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {[
              { href: "/developer", icon: "💻", label: "My Projects",   desc: "Update your project status",  color: "#10b981" },
              { href: "/work",      icon: "💼", label: "Find Work",     desc: "Browse open opportunities",   color: "#6366f1" },
              { href: "/forum",     icon: "💬", label: "Forum",         desc: "Connect with the community",  color: "#14b8a6" },
              { href: "/profile",   icon: "👤", label: "Profile",       desc: "Manage your account",         color: "#f59e0b" },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: "var(--r-md)", transition: "background 0.15s", cursor: "pointer", textDecoration: "none",
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
