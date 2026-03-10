"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type Task = {
  id: string; title: string; assignee: string; client: string;
  priority: "high" | "medium" | "low"; status: "todo" | "in_progress" | "done";
  dueDate: string; avatarColor: string;
};

const MOCK_TASKS: Task[] = [
  { id: "1", title: "Deliver mobile app wireframes",       assignee: "Alex Ko",    client: "TechStart Inc",  priority: "high",   status: "todo",        dueDate: "Mar 20", avatarColor: "avatar-purple" },
  { id: "2", title: "Finalize E-commerce homepage design", assignee: "Sara M.",    client: "Acme Corp",      priority: "high",   status: "in_progress", dueDate: "Mar 18", avatarColor: "avatar-blue" },
  { id: "3", title: "SEO audit report for Q1",            assignee: "Tom B.",     client: "Digital Agency", priority: "medium", status: "in_progress", dueDate: "Mar 22", avatarColor: "avatar-teal" },
  { id: "4", title: "GTM strategy deck v2",               assignee: "Priya S.",   client: "SaaS Startup",   priority: "medium", status: "todo",        dueDate: "Mar 25", avatarColor: "avatar-orange" },
  { id: "5", title: "Infrastructure migration sign-off",   assignee: "David O.",   client: "Cloud Solutions", priority: "low",   status: "done",        dueDate: "Mar 1",  avatarColor: "avatar-pink" },
  { id: "6", title: "Analytics dashboard integration",     assignee: "Emma K.",    client: "DataCo",         priority: "high",   status: "todo",        dueDate: "Apr 5",  avatarColor: "avatar-brand" },
];

const priorityCfg: Record<string, { label: string; cls: string }> = {
  high:   { label: "High",   cls: "badge-danger" },
  medium: { label: "Medium", cls: "badge-warning" },
  low:    { label: "Low",    cls: "badge-neutral" },
};

const statusCfg: Record<string, { label: string; cls: string }> = {
  todo:        { label: "To Do",       cls: "badge-neutral" },
  in_progress: { label: "In Progress", cls: "badge-brand"   },
  done:        { label: "Done",        cls: "badge-success" },
};

function getInitials(name: string) { return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); }

export default function TasksPage() {
  const [tasks,  setTasks]  = useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", assignee: "", client: "", priority: "medium", dueDate: "" });

  const filtered = tasks.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = ["avatar-purple","avatar-blue","avatar-teal","avatar-orange","avatar-pink","avatar-brand"];
    const newTask: Task = {
      id: Date.now().toString(),
      title: form.title, assignee: form.assignee, client: form.client,
      priority: form.priority as any, status: "todo",
      dueDate: form.dueDate || "TBD",
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    };
    setTasks([newTask, ...tasks]);
    setForm({ title: "", assignee: "", client: "", priority: "medium", dueDate: "" });
    setShowModal(false);
  };

  const cycleStatus = (id: string) => {
    const cycle: Record<string, Task["status"]> = { todo: "in_progress", in_progress: "done", done: "todo" };
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: cycle[t.status] } : t));
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Tasks</div>
              <div className="page-subtitle">Track and manage work across all clients</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Task
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid fade-in">
            {[
              { label: "Total Tasks",   value: tasks.length,                                           icon: "📋", color: "avatar-blue" },
              { label: "In Progress",   value: tasks.filter(t=>t.status==="in_progress").length,       icon: "⚡", color: "avatar-brand" },
              { label: "Completed",     value: tasks.filter(t=>t.status==="done").length,              icon: "✅", color: "avatar-teal" },
              { label: "High Priority", value: tasks.filter(t=>t.priority==="high").length,            icon: "🔴", color: "avatar-orange" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`avatar avatar-sm ${s.color}`} style={{ width: 40, height: 40, fontSize: 18, borderRadius: "var(--r-md)", marginBottom: 12 }}>{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter + search */}
          <div className="card fade-in" style={{ padding: "14px 18px", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ width: 220, marginBottom: 0 }} />
              <div className="pill-filter" style={{ margin: 0 }}>
                {["all","todo","in_progress","done"].map(f => (
                  <button key={f} className={`pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                    {f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Task list */}
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">All Tasks</div>
              <span className="badge badge-neutral">{filtered.length} tasks</span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No tasks match.</div></div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Task</th><th>Assignee</th><th>Client</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} style={{ opacity: t.status === "done" ? 0.65 : 1 }}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13.5, textDecoration: t.status === "done" ? "line-through" : "none" }}>
                            {t.title}
                          </div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className={`avatar avatar-sm ${t.avatarColor}`}>{getInitials(t.assignee)}</div>
                            <span style={{ fontSize: 13 }}>{t.assignee}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.client}</td>
                        <td><span className={`badge ${priorityCfg[t.priority].cls}`}>{priorityCfg[t.priority].label}</span></td>
                        <td>
                          <button
                            className={`badge ${statusCfg[t.status].cls}`}
                            style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
                            title="Click to cycle status"
                            onClick={() => cycleStatus(t.id)}
                          >
                            {statusCfg[t.status].label}
                          </button>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Task</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="field"><label className="field-label">Task Title <span className="field-required">*</span></label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Deliver wireframes" required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label className="field-label">Assignee</label><input value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="Team member" /></div>
                <div className="field"><label className="field-label">Client</label><input value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="Client name" /></div>
                <div className="field"><label className="field-label">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                <div className="field"><label className="field-label">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-full">Add Task</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
