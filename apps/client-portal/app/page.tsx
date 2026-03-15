"use client";

import Link from "next/link";
import Navigation from "./components/Navigation";

const quickLinks = [
  { href: "/clients", icon: "👥", label: "Clients",  desc: "Manage your client directory",     color: "#6366f1" },
  { href: "/work",    icon: "💼", label: "Work",     desc: "Browse open opportunities",         color: "#8b5cf6" },
  { href: "/forum",   icon: "💬", label: "Forum",    desc: "Connect with the community",        color: "#14b8a6" },
  { href: "/profile", icon: "👤", label: "Profile",  desc: "Update your account settings",     color: "#f59e0b" },
];

const overviewStats = [
  { value: "4",    label: "Active Projects",   icon: "🚀", color: "#6366f1" },
  { value: "78%",  label: "Avg. Completion",   icon: "📈", color: "#10b981" },
  { value: "$43k", label: "Total Budget",      icon: "💰", color: "#f59e0b" },
  { value: "2",    label: "Due This Month",    icon: "📅", color: "#ec4899" },
];

type ProjectStatus = "On Track" | "At Risk" | "Completed" | "Delayed";

const MY_PROJECTS: {
  name: string; client: string; progress: number;
  status: ProjectStatus; dueDate: string; fill: string;
}[] = [
  { name: "E-commerce Platform",     client: "Acme Corp",     progress: 78,  status: "On Track",  dueDate: "Apr 15", fill: "fill-indigo"  },
  { name: "React Native Mobile App", client: "TechStart Inc", progress: 45,  status: "At Risk",   dueDate: "Mar 28", fill: "fill-warning" },
  { name: "Infrastructure Migration",client: "Cloud Sol.",    progress: 100, status: "Completed", dueDate: "Done",   fill: "fill-success" },
  { name: "GTM Strategy Consulting", client: "SaaS Startup",  progress: 30,  status: "Delayed",   dueDate: "Mar 20", fill: "fill-danger"  },
];

const statusStyle: Record<ProjectStatus, string> = {
  "On Track":  "badge-success",
  "At Risk":   "badge-warning",
  "Completed": "badge-brand",
  "Delayed":   "badge-danger",
};

const ACTIVITY = [
  { icon: "✅", text: "Infrastructure Migration marked complete", time: "2h ago" },
  { icon: "💬", text: "New message from TechStart Inc PM",         time: "5h ago" },
  { icon: "📎", text: "Design mockups uploaded for E-commerce",    time: "1d ago" },
  { icon: "⚠️", text: "Milestone missed: Mobile App sprint 3",    time: "2d ago" },
];

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="fade-in" style={{
          background: "linear-gradient(135deg, #0b0b1a 0%, #12103a 100%)",
          borderRadius: "var(--r-xl)",
          padding: "44px 40px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(99,102,241,0.15)",
        }}>
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: 260, height: 260, borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-30px", left: "25%", width: 180, height: 180, borderRadius: "50%", background: "rgba(139,92,246,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4338ca)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "white" }}>NX</div>
              <span className="badge badge-brand" style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", fontSize: 11 }}>Client Portal</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.5px", marginBottom: 7 }}>
              Welcome back, Khadija 👋
            </h1>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              Your workspace is ready. Track project progress, manage clients, or connect with the community.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/clients" className="btn btn-primary">View Clients</Link>
              <Link href="/work" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.12)" }}>Browse Work</Link>
            </div>
          </div>
        </div>

        {/* ── Overview stats ────────────────────────────────────── */}
        <div className="stats-grid fade-in">
          {overviewStats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Project Progress ──────────────────────────────────── */}
        <div className="card fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <div style={{ fontWeight: 700, fontSize: 15 }}>My Project Progress</div>
            </div>
            <Link href="/work" style={{ fontSize: 12.5, color: "var(--brand-400)", fontWeight: 600 }}>View all →</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MY_PROJECTS.map((proj, i) => (
              <div key={proj.name} style={{
                padding: "14px 0",
                borderBottom: i < MY_PROJECTS.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 1 }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{proj.client}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: proj.progress === 100 ? "var(--success)" : "var(--text)", flexShrink: 0 }}>
                    {proj.progress}%
                  </div>
                  <span className={`badge ${statusStyle[proj.status]}`} style={{ flexShrink: 0 }}>{proj.status}</span>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0, minWidth: 50, textAlign: "right" }}>
                    {proj.dueDate}
                  </div>
                </div>
                <div className="progress-bar-wrap">
                  <div className={`progress-bar-fill ${proj.fill}`} style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom two-column layout ──────────────────────────── */}
        <div className="grid grid-2 fade-in" style={{ gap: 16 }}>

          {/* Quick Access */}
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Quick Access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: "var(--r-md)", transition: "background 0.15s",
                  cursor: "pointer",
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
                  <svg style={{ marginLeft: "auto", color: "var(--text-tertiary)", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recent Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "11px 0",
                  borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}>{a.text}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
