"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type LogEntry = {
  id: string; action: string; actor: string; target: string;
  category: "auth" | "user" | "client" | "system";
  severity: "info" | "warning" | "error"; timestamp: string; ip: string;
};

const MOCK_LOGS: LogEntry[] = [
  { id: "1",  action: "User login successful",       actor: "admin@nexus.com",   target: "admin@nexus.com",   category: "auth",   severity: "info",    timestamp: "2026-03-10 13:45:02", ip: "192.168.1.1" },
  { id: "2",  action: "New user created",            actor: "Administrator",     target: "jane@company.com",  category: "user",   severity: "info",    timestamp: "2026-03-10 12:30:11", ip: "192.168.1.1" },
  { id: "3",  action: "Failed login attempt",        actor: "unknown",           target: "admin@nexus.com",   category: "auth",   severity: "warning", timestamp: "2026-03-10 11:12:45", ip: "203.0.113.45" },
  { id: "4",  action: "Client record updated",       actor: "manager@nexus.com", target: "Acme Corp",         category: "client", severity: "info",    timestamp: "2026-03-10 10:05:30", ip: "192.168.1.5" },
  { id: "5",  action: "User role changed to Admin",  actor: "Administrator",     target: "agent@nexus.com",   category: "user",   severity: "warning", timestamp: "2026-03-09 17:22:10", ip: "192.168.1.1" },
  { id: "6",  action: "System backup completed",     actor: "System",            target: "database",          category: "system", severity: "info",    timestamp: "2026-03-09 03:00:00", ip: "localhost" },
  { id: "7",  action: "Multiple login failures",     actor: "unknown",           target: "manager@nexus.com", category: "auth",   severity: "error",   timestamp: "2026-03-08 22:15:33", ip: "198.51.100.22" },
  { id: "8",  action: "New client added",            actor: "admin@nexus.com",   target: "DataCo",            category: "client", severity: "info",    timestamp: "2026-03-08 15:40:18", ip: "192.168.1.1" },
  { id: "9",  action: "User account deactivated",   actor: "Administrator",     target: "old@company.com",   category: "user",   severity: "warning", timestamp: "2026-03-07 11:05:44", ip: "192.168.1.1" },
  { id: "10", action: "Database migration complete", actor: "System",            target: "database",          category: "system", severity: "info",    timestamp: "2026-03-07 04:00:00", ip: "localhost" },
];

const severityCfg: Record<string, { cls: string; dot: string }> = {
  info:    { cls: "badge-info",    dot: "#3b82f6" },
  warning: { cls: "badge-warning", dot: "#f59e0b" },
  error:   { cls: "badge-danger",  dot: "#ef4444" },
};

const categoryCfg: Record<string, string> = {
  auth:   "badge-brand",
  user:   "badge-neutral",
  client: "badge-violet",
  system: "badge-teal",
};

export default function AuditLogPage() {
  const [logs]         = useState<LogEntry[]>(MOCK_LOGS);
  const [catFilter, setCat]   = useState("all");
  const [sevFilter, setSev]   = useState("all");
  const [search, setSearch]   = useState("");

  const filtered = logs.filter(l => {
    if (catFilter !== "all" && l.category !== catFilter) return false;
    if (sevFilter !== "all" && l.severity !== sevFilter) return false;
    if (search && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.actor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Audit Log</div>
              <div className="page-subtitle">Track every action taken across the system</div>
            </div>
            <span className="badge badge-neutral">{logs.length} entries</span>
          </div>

          {/* Stats */}
          <div className="stats-grid fade-in">
            {[
              { label: "Total Events",  value: logs.length,                                       icon: "📋", color: "avatar-blue" },
              { label: "Warnings",      value: logs.filter(l=>l.severity==="warning").length,     icon: "⚠️", color: "avatar-orange" },
              { label: "Errors",        value: logs.filter(l=>l.severity==="error").length,       icon: "🚨", color: "avatar-pink" },
              { label: "Today",         value: logs.filter(l=>l.timestamp.startsWith("2026-03-10")).length, icon: "📅", color: "avatar-teal" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`avatar avatar-sm ${s.color}`} style={{ width: 40, height: 40, fontSize: 18, borderRadius: "var(--r-md)", marginBottom: 12 }}>{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card fade-in" style={{ padding: "14px 18px", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" style={{ width: 220, marginBottom: 0 }} />
              <div className="pill-filter" style={{ margin: 0 }}>
                {["all","auth","user","client","system"].map(f => (
                  <button key={f} className={`pill ${catFilter === f ? "active" : ""}`} onClick={() => setCat(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <select value={sevFilter} onChange={e => setSev(e.target.value)} style={{ width: 140, marginBottom: 0 }}>
                <option value="all">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Log table */}
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">Event Log</div>
              <span className="badge badge-neutral">{filtered.length} entries</span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No log entries match.</div></div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Severity</th><th>Action</th><th>Actor</th><th>Target</th><th>Category</th><th>IP</th><th>Timestamp</th></tr></thead>
                  <tbody>
                    {filtered.map(log => (
                      <tr key={log.id}>
                        <td>
                          <span className={`badge badge-dot ${severityCfg[log.severity].cls}`}>
                            {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, fontSize: 13.5 }}>{log.action}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{log.actor}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{log.target}</td>
                        <td><span className={`badge ${categoryCfg[log.category]}`}>{log.category}</span></td>
                        <td style={{ color: "var(--text-tertiary)", fontSize: 12, fontFamily: "monospace" }}>{log.ip}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
