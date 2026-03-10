"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Client = {
  id: string; name: string; email: string; company: string;
  status: "active" | "inactive" | "prospect"; projects: number;
  totalValue: number; joinedDate: string; avatarColor: string;
};

const MOCK_CLIENTS: Client[] = [
  { id: "1", name: "Sarah Mitchell",  email: "sarah@acmecorp.com",    company: "Acme Corp",      status: "active",   projects: 3, totalValue: 54000, joinedDate: "Jan 12, 2025", avatarColor: "avatar-purple" },
  { id: "2", name: "James Lee",       email: "james@techstart.io",    company: "TechStart Inc",  status: "active",   projects: 2, totalValue: 28000, joinedDate: "Mar 5, 2025",  avatarColor: "avatar-blue"   },
  { id: "3", name: "Priya Sharma",    email: "priya@cloudsol.com",    company: "Cloud Solutions", status: "active",   projects: 1, totalValue: 9000,  joinedDate: "Nov 20, 2024", avatarColor: "avatar-teal"   },
  { id: "4", name: "Marcus Webb",     email: "marcus@digital.co",     company: "Digital Agency", status: "prospect", projects: 0, totalValue: 0,     joinedDate: "Feb 14, 2026", avatarColor: "avatar-orange" },
  { id: "5", name: "Elena Kovacs",    email: "elena@saasstartup.dev", company: "SaaS Startup",   status: "active",   projects: 2, totalValue: 21000, joinedDate: "May 8, 2025",  avatarColor: "avatar-pink"   },
  { id: "6", name: "David Okonkwo",   email: "david@dataco.io",       company: "DataCo",         status: "inactive", projects: 1, totalValue: 6500,  joinedDate: "Sep 3, 2024",  avatarColor: "avatar-brand"  },
];

const statusCfg: Record<string, { label: string; cls: string }> = {
  active:   { label: "Active",   cls: "badge-success" },
  inactive: { label: "Inactive", cls: "badge-neutral" },
  prospect: { label: "Prospect", cls: "badge-warning" },
};

function getInitials(name: string) { return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); }

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients]   = useState<Client[]>(MOCK_CLIENTS);
  const [search,  setSearch]    = useState("");
  const [filter,  setFilter]    = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", status: "active" });

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (filter !== "all" && c.status !== filter) return false;
    return true;
  });

  const totalValue  = clients.reduce((s, c) => s + c.totalValue, 0);
  const activeCount = clients.filter(c => c.status === "active").length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = ["avatar-purple","avatar-blue","avatar-teal","avatar-orange","avatar-pink","avatar-brand"];
    const newClient: Client = {
      id: Date.now().toString(),
      name: form.name, email: form.email, company: form.company,
      status: form.status as any,
      projects: 0, totalValue: 0,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    };
    setClients([newClient, ...clients]);
    setForm({ name: "", email: "", company: "", status: "active" });
    setShowModal(false);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Clients</div>
              <div className="page-subtitle">Manage your client relationships and projects</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Client
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid fade-in">
            {[
              { label: "Total Clients",  value: clients.length,  icon: "👥", color: "avatar-blue" },
              { label: "Active",         value: activeCount,     icon: "✅", color: "avatar-teal" },
              { label: "Prospects",      value: clients.filter(c=>c.status==="prospect").length, icon: "🎯", color: "avatar-orange" },
              { label: "Total Value",    value: "$" + (totalValue/1000).toFixed(0) + "k", icon: "💰", color: "avatar-purple" },
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ width: 240, marginBottom: 0 }} />
              <div className="pill-filter" style={{ margin: 0 }}>
                {["all","active","inactive","prospect"].map(f => (
                  <button key={f} className={`pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">Client Directory</div>
              <span className="badge badge-neutral">{filtered.length} clients</span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No clients match your search.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Client</th><th>Company</th><th>Status</th><th>Projects</th><th>Value</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const sc = statusCfg[c.status];
                      return (
                        <tr key={c.id}>
                          <td>
                            <div className="user-cell">
                              <div className={`avatar avatar-sm ${c.avatarColor}`}>{getInitials(c.name)}</div>
                              <div className="user-cell-info">
                                <div className="name">{c.name}</div>
                                <div className="email">{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{c.company}</td>
                          <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{c.projects}</td>
                          <td style={{ fontWeight: 600 }}>{c.totalValue > 0 ? "$" + c.totalValue.toLocaleString() : "—"}</td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{c.joinedDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Client</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="field"><label className="field-label">Full Name <span className="field-required">*</span></label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Sarah Mitchell" required /></div>
              <div className="field"><label className="field-label">Email <span className="field-required">*</span></label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="sarah@company.com" required /></div>
              <div className="field"><label className="field-label">Company</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Acme Corp" /></div>
              <div className="field"><label className="field-label">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="prospect">Prospect</option><option value="inactive">Inactive</option></select></div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-full">Add Client</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
