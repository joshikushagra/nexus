"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { fetchUsers, createUser } from "../../lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
};

const roleConfig: Record<string, { label: string; cls: string; desc: string }> = {
  founder:   { label: "Founder",     cls: "badge-danger",   desc: "Full access, manage platform" },
  developer: { label: "Developer",   cls: "badge-brand",    desc: "Collaborators and builders" },
  client:    { label: "Client",      cls: "badge-success",  desc: "Post requirements and hire" },
};

const avatarColors = ["avatar-purple", "avatar-blue", "avatar-teal", "avatar-orange", "avatar-pink", "avatar-brand"];
function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }
function getColor(name: string)    { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "developer" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const load = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchUsers(token);
      setUsers(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.email.includes("@")) errs.email = "Enter a valid email address";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setError("");
    setSuccess("");
    setFormLoading(true);
    try {
      const token = localStorage.getItem("admin_token")!;
      await createUser(token, form);
      setSuccess(`User "${form.name}" created successfully!`);
      setForm({ name: "", email: "", password: "", role: "developer" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">User Management</div>
              <div className="page-subtitle">Create and manage team members &amp; their permissions</div>
            </div>
            <span className="badge badge-neutral">{users.length} total users</span>
          </div>

          {error   && <div className="alert alert-error   fade-in">{error}</div>}
          {success && <div className="alert alert-success fade-in">{success}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "start" }}>
            {/* Create Form */}
            <div className="card fade-in" style={{ position: "sticky", top: 24 }}>
              <div className="card-title" style={{ marginBottom: 20 }}>Create New User</div>
              <form onSubmit={handleCreate}>
                <div className="field">
                  <label className="field-label" htmlFor="u-name">Full Name <span className="field-required">*</span></label>
                  <input
                    id="u-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                  />
                  {formErrors.name && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: -8 }}>{formErrors.name}</div>}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="u-email">Email Address <span className="field-required">*</span></label>
                  <input
                    id="u-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@company.com"
                  />
                  {formErrors.email && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: -8 }}>{formErrors.email}</div>}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="u-password">Password <span className="field-required">*</span></label>
                  <input
                    id="u-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                  />
                  {formErrors.password && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: -8 }}>{formErrors.password}</div>}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="u-role">Role</label>
                  <select
                    id="u-role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {Object.entries(roleConfig).map(([key, { label, desc }]) => (
                      <option key={key} value={key}>{label} — {desc}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={formLoading}
                  style={{ marginTop: 4 }}
                >
                  {formLoading ? <div className="spinner" /> : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                  {formLoading ? "Creating…" : "Create User"}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">Team Members</div>
              </div>

              {loading ? (
                <div className="empty-state">
                  <div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} />
                  <div className="empty-state-text">Loading users…</div>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-text">No users yet. Create the first one!</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
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
                                <div className="user-cell-info">
                                  <div className="name">{user.name}</div>
                                  <div className="email">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className={`badge ${rc.cls}`}>{rc.label}</span></td>
                            <td>
                              <span className="badge badge-dot badge-success">
                                Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
