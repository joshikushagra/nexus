"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Task = {
  _id: string; 
  title: string; 
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "high" | "medium" | "low";
  projectId: { _id: string; title: string };
  assignedTo?: string;
  deadline?: string;
};

type Project = { _id: string; title: string };

const priorityCfg: Record<string, { label: string; cls: string }> = {
  high:   { label: "High",   cls: "badge-danger" },
  medium: { label: "Medium", cls: "badge-warning" },
  low:    { label: "Low",    cls: "badge-neutral" },
};

const statusCfg: Record<string, { label: string; cls: string }> = {
  todo:          { label: "To Do",       cls: "badge-neutral" },
  "in-progress": { label: "In Progress", cls: "badge-brand"   },
  review:        { label: "Review",      cls: "badge-warning" },
  completed:     { label: "Completed",   cls: "badge-success" },
};

export default function TasksPage() {
  const [tasks,  setTasks]  = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", projectId: "", priority: "medium", deadline: "" });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); return; }

    const fetchAll = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          fetch(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const tJson = await tRes.json();
        const pJson = await pRes.json();
        setTasks(tJson.data || []);
        setProjects(pJson.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = tasks.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    const titleMatch = t.title.toLowerCase().includes(search.toLowerCase());
    const projectMatch = t.projectId?.title?.toLowerCase().includes(search.toLowerCase());
    if (search && !titleMatch && !projectMatch) return false;
    return true;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        setTasks([json.data, ...tasks]);
        setShowModal(false);
        setForm({ title: "", description: "", projectId: "", priority: "medium", deadline: "" });
      }
    } catch (e) { console.error(e); }
  };

  const cycleStatus = async (id: string, current: string) => {
    const cycle: Record<string, Task["status"]> = { todo: "in-progress", "in-progress": "review", review: "completed", completed: "todo" };
    const next = cycle[current];
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next }),
      });
      setTasks(ts => ts.map(t => t._id === id ? { ...t, status: next } : t));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Tasks</div>
              <div className="page-subtitle">Track and manage work across all projects</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Task
            </button>
          </div>

          {loading ? <div className="spinner-fixed"><div className="spinner" /></div> : (
            <>
              {/* Stats */}
              <div className="stats-grid fade-in">
                {[
                  { label: "Total Tasks",   value: tasks.length,                                           icon: "📋", color: "avatar-blue" },
                  { label: "In Progress",   value: tasks.filter(t=>t.status==="in-progress").length,       icon: "⚡", color: "avatar-brand" },
                  { label: "Completed",     value: tasks.filter(t=>t.status==="completed").length,         icon: "✅", color: "avatar-teal" },
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
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or projects…" style={{ width: 220, marginBottom: 0 }} />
                  <div className="pill-filter" style={{ margin: 0 }}>
                    {["all","todo","in-progress","review","completed"].map(f => (
                      <button key={f} className={`pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task list */}
              <div className="card fade-in">
                <div className="card-header">
                  <div className="card-title">All Project Tasks</div>
                  <span className="badge badge-neutral">{filtered.length} tasks</span>
                </div>
                {filtered.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No tasks match.</div></div>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead>
                      <tbody>
                        {filtered.map(t => (
                          <tr key={t._id} style={{ opacity: t.status === "completed" ? 0.65 : 1 }}>
                            <td><div style={{ fontWeight: 600, fontSize: 13.5, textDecoration: t.status === "completed" ? "line-through" : "none" }}>{t.title}</div></td>
                            <td style={{ color: "var(--brand-400)", fontSize: 13, fontWeight: 600 }}>{t.projectId?.title || "No Project"}</td>
                            <td><span className={`badge ${priorityCfg[t.priority]?.cls}`}>{priorityCfg[t.priority]?.label}</span></td>
                            <td>
                              <button
                                className={`badge ${statusCfg[t.status]?.cls}`}
                                style={{ cursor: "pointer", border: "none" }}
                                onClick={() => cycleStatus(t._id, t.status)}
                              >
                                {statusCfg[t.status]?.label}
                              </button>
                            </td>
                            <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.deadline ? new Date(t.deadline).toLocaleDateString() : "TBD"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Project Task</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="field"><label className="field-label">Task Title*</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Design homepage" required /></div>
              <div className="field"><label className="field-label">Description</label><textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Internal notes..." /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label className="field-label">Project*</label>
                  <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="field"><label className="field-label">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                <div className="field"><label className="field-label">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Create Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
