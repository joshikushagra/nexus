"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { fetchUsers, fetchProjects, fetchDashboardStats } from "../../lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
  createdAt: string;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  projectType: string;
  status: string;
  budgetUsed?: number;
  totalBudget?: number;
  dueDate?: string;
  createdAt: string;
};

const roleConfig: Record<string, { label: string; cls: string }> = {
  founder:      { label: "Founder",      cls: "badge-danger" },
  admin:        { label: "Admin",        cls: "badge-danger" },
  developer:    { label: "Developer",    cls: "badge-brand" },
  client:       { label: "Client",       cls: "badge-success" },
  client_owner: { label: "Client Owner", cls: "badge-success" },
  client_team:  { label: "Client Team",  cls: "badge-neutral" },
};

const avatarColors = ["avatar-purple","avatar-blue","avatar-teal","avatar-orange","avatar-pink","avatar-brand"];
const getInitials  = (n: string) => (n ? n.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "??");
const getColor     = (n: string) => avatarColors[(n || "A").charCodeAt(0) % avatarColors.length];

const statusStyleMap: Record<string, { cls: string; fill: string }> = {
  "active":    { cls: "badge-brand",   fill: "fill-indigo" },
  "completed": { cls: "badge-success", fill: "fill-success" },
  "pending":   { cls: "badge-neutral", fill: "fill-neutral" },
};

const STAT_CARDS = [
  { label: "Total Users",    icon: "👥", colorClass: "avatar-blue",   valueKey: "totalUsers" as const },
  { label: "Active Projects", icon: "🚀", colorClass: "avatar-teal",   valueKey: "activeProjects" as const },
  { label: "Open Tasks",     icon: "📋", colorClass: "avatar-purple", valueKey: "openTasks" as const },
  { label: "Completed",      icon: "✅", colorClass: "avatar-brand",  valueKey: "completedTasks" as const },
];

export default function DashboardPage() {
  const router = useRouter();
  const [users, setUsers]       = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); return; }
    
    const tokenStr = token as string;

    Promise.all([
      fetchUsers(tokenStr), 
      fetchProjects(tokenStr),
      fetchDashboardStats(tokenStr)
    ])
      .then(([usersRes, projectsRes, statsRes]) => {
        setUsers(usersRes.data || []);
        setProjects(projectsRes.data || []);
        setLiveStats(statsRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const stats = liveStats || {
    totalUsers: users.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    openTasks: 0,
    completedTasks: 0
  };

  const active = projects.filter(p => p.status === "active").length;
  const completed = projects.filter(p => p.status === "completed").length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Dashboard</div>
              <div className="page-subtitle">Overview of your team, clients, and system activity</div>
            </div>
            <a href="/users" className="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add User
            </a>
          </div>

          {error && (
            <div className="alert alert-error fade-in">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error} — make sure the backend is running.
            </div>
          )}

          {/* ── Stat cards ───────────────────────────────────────── */}
          <div className="stats-grid fade-in">
            {STAT_CARDS.map(({ label, icon, colorClass, valueKey }) => (
              <div className="stat-card" key={label}>
                <div className={`avatar avatar-sm ${colorClass}`} style={{ width: 40, height: 40, fontSize: 18, borderRadius: "var(--r-md)", marginBottom: 12 }}>
                  {icon}
                </div>
                <div className="stat-card-value">{loading ? "—" : stats[valueKey]}</div>
                <div className="stat-card-label">{label}</div>
                <div className="stat-card-trend neutral">{loading ? "Loading…" : "↑ All time"}</div>
              </div>
            ))}
          </div>

          {/* ── Client Progress ───────────────────────────────────── */}
          <div className="card fade-in">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <div className="card-title">Client Progress</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge badge-success">{active} active</span>
                <span className="badge badge-brand">{completed} done</span>
                <span className="badge badge-neutral">{projects.length} total</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {projects.length === 0 && <div className="empty-state">No current projects</div>}
              {projects.map((project, i) => {
                const ss = statusStyleMap[project.status] || { cls: "badge-neutral", fill: "fill-indigo" };
                const budgetPct = 50; // Mock budget indicator for now
                return (
                  <div
                    key={project._id}
                    style={{
                      padding: "14px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div className={`avatar avatar-sm ${getColor(project.title)}`}>{getInitials(project.title)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 1 }}>{project.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{project.projectType}</div>
                      </div>

                      {/* Status badge */}
                      <span className={`badge ${ss.cls}`} style={{ flexShrink: 0 }}>{project.status}</span>

                      {/* Due date */}
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0, minWidth: 80, textAlign: "right" }}>
                        📅 {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Progress bars (removed for simplicity on generic project view) */}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Team members table ─────────────────────────────── */}
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">Team Members</div>
              <span className="badge badge-neutral">{users.length} users</span>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} />
                <div className="empty-state-text">Loading users…</div>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No users found. <a href="/users" style={{ color: "var(--brand-400)" }}>Create the first one →</a></div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const rc = roleConfig[user.role] || { label: user.role, cls: "badge-neutral" };
                      return (
                        <tr key={user._id}>
                          <td>
                            <div className="user-cell">
                              <div className={`avatar avatar-sm ${getColor(user.name)}`}>{getInitials(user.name)}</div>
                              <div className="user-cell-info"><div className="name">{user.name}</div></div>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{user.email}</td>
                          <td><span className={`badge ${rc.cls}`}>{rc.label}</span></td>
                          <td>
                            <span className="badge badge-dot badge-success">
                              Active
                            </span>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Quick Actions ─────────────────────────────────────── */}
          <div className="card fade-in" style={{ padding: "18px 22px" }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/users"   className="btn btn-secondary btn-sm">Manage Users</a>
              <a href="/clients" className="btn btn-secondary btn-sm">View Clients</a>
              <a href="/tasks"   className="btn btn-secondary btn-sm">Review Tasks</a>
              <a href="/audit"   className="btn btn-secondary btn-sm">Audit Log</a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
