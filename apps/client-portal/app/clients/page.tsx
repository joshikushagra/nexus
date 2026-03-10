"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, fetchClients } from "../../lib/api";
import Navigation from "../components/Navigation";

type Client = { _id: string; name: string; company?: string; email?: string; role: string; };

const statusConfig: Record<string, { label: string; cls: string }> = {
  client:    { label: "Active",   cls: "badge-success" },
  developer: { label: "Lead",     cls: "badge-warning" },
  founder:   { label: "Archived", cls: "badge-danger"  },
};

const avatarColors = ["avatar-brand","avatar-purple","avatar-blue","avatar-teal","avatar-orange","avatar-pink"];
const getInitials  = (n: string) => (n ? n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0,2) : "??");
const getColor     = (n: string) => avatarColors[(n || "a").charCodeAt(0) % avatarColors.length];

export default function ClientsPage() {
  const [clients,     setClients]     = useState<Client[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error,       setError]       = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [search,      setSearch]      = useState("");
  const [form, setForm] = useState({ name: "", company: "", email: "" });
  const router = useRouter();

  async function load() {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("client_token") || "mock_token";
      const data = await fetchClients(token);
      // The backend returns an object `{ data: [...] }`. Filter out to ensure we only see 'client'
      setClients((data.data || []).filter((u: any) => u.role === "client"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || (c.company || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setFormLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("client_token") || "mock_token";
      await createClient(token, { name: form.name, company: form.company, email: form.email, status: "lead", tags: [] });
      setForm({ name: "", company: "", email: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <>
      <Navigation />
      <main>
        {/* Header */}
        <div className="page-header fade-in">
          <div>
            <div className="page-title">Client Directory</div>
            <div className="page-subtitle">{clients.length} clients in your network</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              style={{ width: 220, marginBottom: 0 }}
            />
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {showForm ? "Cancel" : "Add Client"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error fade-in">{error}</div>}

        {/* Add client form */}
        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 24, borderColor: "var(--brand-200)", boxShadow: "0 0 0 3px rgba(99,102,241,0.08)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>New Client</div>
            <form onSubmit={handleAdd}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 16 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">Name <span className="field-required">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">Company</label>
                  <input value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} placeholder="Acme Inc." />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="john@example.com" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={formLoading}>
                {formLoading ? <><div className="spinner" /> Creating…</> : "Create Client"}
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid fade-in">
          {[
            { label: "Total Clients",    value: clients.length,                                    color: "#6366f1", bg: "#eef2ff", icon: "👥" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.bg, width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Client Cards */}
        {isLoading ? (
          <div className="empty-state"><div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} /><div className="empty-text">Loading clients…</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">{search ? "No clients match your search." : "No clients yet. Create one above!"}</div></div>
        ) : (
          <div className="grid grid-3 fade-in">
            {filtered.map((client) => {
              const sc = statusConfig[client.role] || { label: client.role, cls: "badge-neutral" };
              return (
                <div key={client._id} className="card card-hover" style={{ marginBottom: 0, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className={`avatar avatar-md ${getColor(client.name)}`}>{getInitials(client.name)}</div>
                    <span className={`badge ${sc.cls}`}>{sc.label}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{client.name}</div>
                  {client.company && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 2 }}>🏢 {client.company}</div>}
                  {client.email   && <div style={{ fontSize: 13, color: "var(--brand-600)", marginTop: 4 }}>{client.email}</div>}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm btn-full">View</button>
                    <button className="btn btn-ghost btn-sm">Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
