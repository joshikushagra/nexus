"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { getCurrentUser } from "../../lib/api";

type Tab = "profile" | "settings" | "security";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    skills: "",
    theme: "auto",
    language: "English",
    notifications: true,
    emailUpdates: true,
    privacy: "public",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("client_token") || "mock_token";
      const res = await getCurrentUser(token); // Will map to dummy logic
      const user = res.data;
      if (user) {
        setProfile(p => ({
          ...p,
          fullName: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          location: user.location || "",
          skills: (user.skills || []).join(", "),
        }));
      }
    } catch (e) {
      setError("Failed to load profile. Maybe backend is unavailable.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const set = (k: string, v: any) => setProfile((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    // In a full implementation, this calls an update endpoint.
    // We mock the network delay for now, since we haven't created a PUT /users/me yet.
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 900);
  };

  const skillList = profile.skills.split(",").map(s => s.trim()).filter(Boolean);

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "profile",  icon: "👤", label: "Profile"  },
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "security", icon: "🔒", label: "Security" },
  ];

  return (
    <>
      <Navigation />
      <main>
        <div className="page-header fade-in">
          <div>
            <div className="page-title">My Profile</div>
            <div className="page-subtitle">Manage your personal information and preferences</div>
          </div>
        </div>

        {saved && <div className="alert alert-success fade-in">✓ Profile saved successfully!</div>}
        {error && <div className="alert alert-error fade-in">{error}</div>}

        {loading ? (
          <div className="empty-state">
            <div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} />
            <div className="empty-state-text">Loading profile…</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }} className="fade-in">
            {/* Left sidebar */}
            <div>
              {/* Avatar card */}
            <div className="card" style={{ textAlign: "center", padding: "28px 20px" }}>
              <div className="avatar avatar-xl avatar-brand" style={{ margin: "0 auto 16px" }}>
                {profile.fullName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{profile.fullName}</div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 14 }}>📍 {profile.location}</div>

              {/* Skills preview */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 20 }}>
                {skillList.slice(0,4).map((s) => <span key={s} className="skill-tag" style={{ fontSize: 11 }}>{s}</span>)}
                {skillList.length > 4 && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>+{skillList.length-4}</span>}
              </div>

              {/* Stats */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { val: "24", label: "Projects" , color: "var(--brand-600)" },
                  { val: "4.9", label: "Rating",   color: "#f59e0b" },
                  { val: "2yr", label: "Member",   color: "var(--success)" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab buttons */}
            <div className="card" style={{ padding: 10 }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`btn ${activeTab === t.id ? "btn-primary" : "btn-ghost"} btn-full`}
                  style={{ justifyContent: "flex-start", marginBottom: 4 }}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right content */}
          <div>
            {activeTab === "profile" && (
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 22 }}>Edit Profile</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="field"><label className="field-label">Full Name</label><input value={profile.fullName} onChange={(e)=>set("fullName",e.target.value)} placeholder="Your name" /></div>
                  <div className="field"><label className="field-label">Email</label><input type="email" value={profile.email} onChange={(e)=>set("email",e.target.value)} placeholder="you@example.com" /></div>
                  <div className="field"><label className="field-label">Phone</label><input value={profile.phone} onChange={(e)=>set("phone",e.target.value)} placeholder="+1 555 123 4567" /></div>
                  <div className="field"><label className="field-label">Location</label><input value={profile.location} onChange={(e)=>set("location",e.target.value)} placeholder="City, Country" /></div>
                  <div className="field" style={{ gridColumn:"1/-1" }}><label className="field-label">Website</label><input type="url" value={profile.website} onChange={(e)=>set("website",e.target.value)} placeholder="https://yoursite.com" /></div>
                  <div className="field" style={{ gridColumn:"1/-1" }}><label className="field-label">Bio</label><textarea rows={3} value={profile.bio} onChange={(e)=>set("bio",e.target.value)} placeholder="Tell us about yourself…" /></div>
                  <div className="field" style={{ gridColumn:"1/-1" }}><label className="field-label">Skills (comma-separated)</label><input value={profile.skills} onChange={(e)=>set("skills",e.target.value)} placeholder="React, Node.js, Python" /></div>
                </div>
                {skillList.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:8 }}>PREVIEW</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{skillList.map(s=><span key={s} className="skill-tag">{s}</span>)}</div>
                  </div>
                )}
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><div className="spinner" /> Saving…</> : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 22 }}>Preferences</div>
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontWeight:600, marginBottom:14, color:"var(--text-secondary)", fontSize:12, textTransform:"uppercase", letterSpacing:"0.5px" }}>Appearance</div>
                  <div className="field"><label className="field-label">Theme</label><select value={profile.theme} onChange={(e)=>set("theme",e.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto (System)</option></select></div>
                  <div className="field"><label className="field-label">Language</label><select value={profile.language} onChange={(e)=>set("language",e.target.value)}><option>English</option><option>Hindi</option><option>Spanish</option><option>French</option><option>German</option></select></div>
                </div>
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontWeight:600, marginBottom:14, color:"var(--text-secondary)", fontSize:12, textTransform:"uppercase", letterSpacing:"0.5px" }}>Notifications</div>
                  {[
                    { key:"notifications", label:"Enable push notifications" },
                    { key:"emailUpdates",  label:"Receive email updates" },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                      <input type="checkbox" checked={(profile as any)[key]} onChange={(e)=>set(key,e.target.checked)} style={{ width:"auto", cursor:"pointer" }} />
                      <span style={{ fontSize:14, fontWeight:500 }}>{label}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontWeight:600, marginBottom:14, color:"var(--text-secondary)", fontSize:12, textTransform:"uppercase", letterSpacing:"0.5px" }}>Privacy</div>
                  <div className="field"><label className="field-label">Profile Visibility</label><select value={profile.privacy} onChange={(e)=>set("privacy",e.target.value)}><option value="public">Public</option><option value="friends">Connections Only</option><option value="private">Private</option></select></div>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><div className="spinner" /> Saving…</> : "Save Preferences"}
                </button>
              </div>
            )}

            </div>
          </div>
        )}
      </main>
    </>
  );
}
