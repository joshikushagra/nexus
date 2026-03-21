"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Repo = {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  private: boolean;
};

type Member = {
  id: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
};

type OrgInfo = {
  login: string;
  name: string | null;
  description: string | null;
  avatarUrl: string;
  publicRepos: number;
  htmlUrl: string;
};

type LinkedOrg = {
  _id: string;
  name: string;
  githubOrgName: string;
  description: string;
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  CSS: "#563d7c", HTML: "#e34c26", Shell: "#89e051",
};

export default function GitHubOrgPage() {
  const [orgSlug, setOrgSlug]         = useState("");
  const [orgInfo, setOrgInfo]         = useState<OrgInfo | null>(null);
  const [repos, setRepos]             = useState<Repo[]>([]);
  const [members, setMembers]         = useState<Member[]>([]);
  const [linkedOrgs, setLinkedOrgs]   = useState<LinkedOrg[]>([]);
  const [orgName, setOrgName]         = useState("");
  const [orgDesc, setOrgDesc]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  // Load already-linked orgs on mount
  useEffect(() => {
    fetch(`${API}/organizations`)
      .then((r) => r.json())
      .then((j) => setLinkedOrgs(j.data || []))
      .catch(() => {});
  }, []);

  const fetchOrgData = async () => {
    if (!orgSlug.trim()) return;
    setLoading(true);
    setError("");
    setOrgInfo(null);
    setRepos([]);
    setMembers([]);
    try {
      const [infoRes, reposRes, membersRes] = await Promise.all([
        fetch(`${API}/github/org/${orgSlug.trim()}`),
        fetch(`${API}/github/org/${orgSlug.trim()}/repos`),
        fetch(`${API}/github/org/${orgSlug.trim()}/members`),
      ]);
      const [infoJson, reposJson, membersJson] = await Promise.all([
        infoRes.json(), reposRes.json(), membersRes.json(),
      ]);
      if (!infoRes.ok) throw new Error(infoJson.message || "Org not found");
      setOrgInfo(infoJson.data);
      setRepos(reposJson.data || []);
      setMembers(membersJson.data || []);
      setOrgName(infoJson.data.name || orgSlug.trim());
      setOrgDesc(infoJson.data.description || "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch org");
    } finally {
      setLoading(false);
    }
  };

  const linkOrg = async () => {
    if (!orgInfo) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin_token") || "mock_token";
      const res = await fetch(`${API}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: orgName, githubOrgName: orgSlug.trim(), description: orgDesc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to link org");
      setLinkedOrgs((prev) => [json.data, ...prev]);
      setSuccess(`✓ "${orgName}" linked successfully!`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to link org");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="page-content">

          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">GitHub Organization</div>
              <div className="page-subtitle">Link a GitHub org to sync repos and members</div>
            </div>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="alert alert-error fade-in" style={{ marginBottom: 16 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success fade-in" style={{ marginBottom: 16 }}>
              {success}
            </div>
          )}

          {/* Already-linked orgs */}
          {linkedOrgs.length > 0 && (
            <div className="card fade-in" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <div className="card-title">Linked Organizations</div>
                <span className="badge badge-brand">{linkedOrgs.length}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {linkedOrgs.map((o) => (
                  <div key={o._id} style={{ background: "var(--surface-2)", borderRadius: "var(--r-md)", padding: "10px 16px", cursor: "pointer" }}
                    onClick={() => { setOrgSlug(o.githubOrgName); }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>@{o.githubOrgName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search / Fetch */}
          <div className="card fade-in">
            <div className="card-header"><div className="card-title">Search GitHub Organization</div></div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="input"
                placeholder="GitHub org slug (e.g. microsoft)"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchOrgData()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={fetchOrgData} disabled={loading}>
                {loading ? "Fetching…" : "Fetch Org"}
              </button>
            </div>
          </div>

          {/* Org Info Preview */}
          {orgInfo && (
            <div className="card fade-in">
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <img src={orgInfo.avatarUrl} alt={orgInfo.login} style={{ width: 72, height: 72, borderRadius: "var(--r-md)", border: "2px solid var(--border)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>{orgInfo.name || orgInfo.login}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>@{orgInfo.login} · {orgInfo.publicRepos} public repos</div>
                  {orgInfo.description && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{orgInfo.description}</div>}

                  {/* Link form */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input className="input" placeholder="Display name" value={orgName} onChange={(e) => setOrgName(e.target.value)} style={{ flex: "1 1 180px" }} />
                    <input className="input" placeholder="Description (optional)" value={orgDesc} onChange={(e) => setOrgDesc(e.target.value)} style={{ flex: "2 1 260px" }} />
                    <button className="btn btn-primary" onClick={linkOrg} disabled={saving}>{saving ? "Linking…" : "Link to Platform"}</button>
                  </div>
                </div>
                <a href={orgInfo.htmlUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View on GitHub ↗</a>
              </div>
            </div>
          )}

          {/* Repos list */}
          {repos.length > 0 && (
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">Repositories</div>
                <span className="badge badge-neutral">{repos.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {repos.map((repo) => (
                  <a key={repo.id} href={repo.htmlUrl} target="_blank" rel="noopener noreferrer"
                    style={{ background: "var(--surface-2)", borderRadius: "var(--r-md)", padding: "14px 16px", display: "block", textDecoration: "none", border: "1px solid var(--border)", transition: "border-color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--brand-400)")}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--brand-400)" }}>{repo.name}</div>
                      {repo.private && <span className="badge badge-neutral" style={{ fontSize: 11 }}>Private</span>}
                    </div>
                    {repo.description && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>{repo.description}</div>}
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-tertiary)", alignItems: "center" }}>
                      {repo.language && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: LANG_COLORS[repo.language] || "#888", display: "inline-block" }} />
                          {repo.language}
                        </span>
                      )}
                      <span>★ {repo.stars}</span>
                      <span>⑂ {repo.forks}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Members list */}
          {members.length > 0 && (
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">Public Members</div>
                <span className="badge badge-neutral">{members.length}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {members.map((m) => (
                  <a key={m.id} href={m.htmlUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)", borderRadius: "var(--r-md)", padding: "10px 14px", textDecoration: "none", border: "1px solid var(--border)" }}>
                    <img src={m.avatarUrl} alt={m.login} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.login}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
