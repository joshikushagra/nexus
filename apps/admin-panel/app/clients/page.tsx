"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { fetchUsers } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Client = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const statusCfg: Record<string, { label: string; cls: string }> = {
  active:   { label: "Active",   cls: "badge-success" },
  inactive: { label: "Inactive", cls: "badge-neutral" },
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [error, setError]       = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); return; }

    fetchUsers(token)
      .then(res => {
        const list = res.data || [];
        setClients(list.filter((u: any) => u.role === 'client' || u.role === 'client_owner'));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    return true;
  });

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarColors = ["avatar-purple","avatar-blue","avatar-teal","avatar-orange","avatar-pink"];
  const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Client Directory</div>
              <div className="page-subtitle">Manage your client relationships across the platform</div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Table */}
          <div className="card fade-in">
            <div className="card-header">
              <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search clients…" 
                  style={{ width: 240, marginBottom: 0 }} 
                />
              </div>
              <span className="badge badge-neutral">{filtered.length} clients</span>
            </div>

            {loading ? (
              <div className="empty-state"><div className="spinner spinner-dark" /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No clients found.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Client</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c._id}>
                        <td>
                          <div className="user-cell">
                            <div className={`avatar avatar-sm ${getColor(c.name)}`}>{getInitials(c.name)}</div>
                            <div className="user-cell-info"><div className="name">{c.name}</div></div>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{c.email}</td>
                        <td><span className="badge badge-success">{c.role.replace('_', ' ')}</span></td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
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
