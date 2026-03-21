"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  createdAt: string;
  teamMembers: string[];
};

type OrgRepo = {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
};

type Organization = {
  _id: string;
  name: string;
  githubOrgName: string;
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", CSS: "#563d7c", HTML: "#e34c26",
};

const progressColor = (p: number) =>
  p === 100 ? "#10b981" : p >= 60 ? "#6366f1" : p >= 30 ? "#f59e0b" : "#ef4444";

const quickLinks = [
  { href: "/clients",   icon: "👥", label: "Clients",   desc: "Manage your client directory",   color: "#6366f1" },
  { href: "/work",      icon: "💼", label: "Work",      desc: "Browse open opportunities",       color: "#8b5cf6" },
  { href: "/forum",     icon: "💬", label: "Forum",     desc: "Connect with the community",      color: "#14b8a6" },
  { href: "/profile",   icon: "👤", label: "Profile",   desc: "Update your account settings",   color: "#f59e0b" },
];

export default function DashboardPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [org, setOrg]             = useState<Organization | null>(null);
  const [repos, setRepos]         = useState<OrgRepo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const projRes = await fetch(`${API}/projects`);
        const projJson = await projRes.json();
        setProjects(projJson.data || []);

        const orgRes = await fetch(`${API}/organizations`);
        const orgJson = await orgRes.json();
        const orgs: Organization[] = orgJson.data || [];
        if (orgs.length > 0) {
          const firstOrg = orgs[0];
          setOrg(firstOrg);
          const reposRes = await fetch(`${API}/github/org/${firstOrg.githubOrgName}/repos`);
          const reposJson = await reposRes.json();
          setRepos((reposJson.data || []).slice(0, 6));
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeProjects = projects.filter((p) => p.status === "active");
  const avgProgress = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  const overviewStats = [
    { value: loading ? "—" : String(activeProjects.length), label: "Active Projects", icon: "🚀", color: "#6366f1" },
    { value: loading ? "—" : `${avgProgress}%`,             label: "Avg. Completion",  icon: "📈", color: "#10b981" },
    { value: loading ? "—" : String(projects.length),       label: "Total Projects",   icon: "📂", color: "#f59e0b" },
    { value: loading ? "—" : org ? org.name : "—",         label: "GitHub Org",       icon: "🐙", color: "#ec4899" },
  ];

  return (
    <>
      <Navigation />
      <main>
        {/* ── Hero */}
        <div className="fade-in" style={{
          background: "linear-gradient(135deg, #0b0b1a 0%, #12103a 100%)",
          borderRadius: "var(--r-xl)", padding: "44px 40px", marginBottom: 24,
          position: "relative", overflow: "hidden", border: "1px solid rgba(99,102,241,0.15)",
        }}>
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: 260, height: 260, borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4338ca)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "white" }}>NX</div>
              <span className="badge badge-brand" style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)", fontSize: 11 }}>Client Portal</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.5px", marginBottom: 7 }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              Track your projects in real time, explore the GitHub org, and manage your workspace.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/clients" className="btn btn-primary">View Clients</Link>
              <Link href="/work" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.12)" }}>Browse Work</Link>
              {org && (
                <a href={`https://github.com/${org.githubOrgName}`} target="_blank" rel="noopener noreferrer"
                  className="btn" style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}>
                  🐙 {org.name} on GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error fade-in" style={{ marginBottom: 16 }}>
            {error} — ensure the backend is running.
          </div>
        )}

        {/* ── Overview stats */}
        <div className="stats-grid fade-in">
          {overviewStats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Project Progress */}
        <div className="card fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Project Progress</div>
            </div>
            <Link href="/work" style={{ fontSize: 12.5, color: "var(--brand-400)", fontWeight: 600 }}>View all →</Link>
          </div>

          {loading ? (
            <div className="empty-state"><div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} /><div>Loading projects…</div></div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <div className="empty-state-text">No projects yet. Ask your admin to create one.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {projects.map((proj, i) => (
                <div key={proj._id} style={{ padding: "14px 0", borderBottom: i < projects.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 1 }}>{proj.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{proj.projectType}
                        {proj.progressNotes && <> · <em>{proj.progressNotes}</em></>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: progressColor(proj.progress || 0), flexShrink: 0 }}>
                      {proj.progress || 0}%
                    </div>
                    <span className={`badge ${proj.status === "completed" ? "badge-brand" : "badge-success"}`} style={{ flexShrink: 0 }}>
                      {proj.status}
                    </span>
                    {proj.githubRepoUrl && (
                      <a href={proj.githubRepoUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "var(--brand-400)", flexShrink: 0 }}>🔗 Repo</a>
                    )}
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${proj.progress || 0}%`, background: progressColor(proj.progress || 0) }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── GitHub Org Repos */}
        {org && repos.length > 0 && (
          <div className="card fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 18 }}>🐙</span>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{org.name} · Repositories</div>
              </div>
              <a href={`https://github.com/${org.githubOrgName}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12.5, color: "var(--brand-400)", fontWeight: 600 }}>View org ↗</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {repos.map((repo) => (
                <a key={repo.id} href={repo.htmlUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: "var(--surface-2)", borderRadius: "var(--r-md)", padding: "14px 16px", textDecoration: "none", border: "1px solid var(--border)", display: "block", transition: "border-color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--brand-400)")}
                  onMouseOut={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--brand-400)", marginBottom: 5 }}>{repo.name}</div>
                  {repo.description && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>{repo.description}</div>}
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-tertiary)", alignItems: "center" }}>
                    {repo.language && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: LANG_COLORS[repo.language] || "#888", display: "inline-block" }} />
                        {repo.language}
                      </span>
                    )}
                    <span>★ {repo.stars}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Access */}
        <div className="card fade-in">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Quick Access</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: "var(--r-md)", transition: "background 0.15s", cursor: "pointer",
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
