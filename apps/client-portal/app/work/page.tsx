"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

type Work = {
  id: string; title: string; description: string; category: string;
  budget: number; status: "open" | "in_progress" | "completed";
  rating: number; reviews: number; postedBy: string; postedDate: string;
  deadline: string; skills: string[];
};

const categories = ["development", "design", "marketing", "writing", "consulting"];
const statuses   = ["open", "in_progress", "completed"];

const statusConfig: Record<string, { label: string; cls: string }> = {
  open:        { label: "Open",        cls: "badge-success" },
  in_progress: { label: "In Progress", cls: "badge-warning" },
  completed:   { label: "Completed",   cls: "badge-brand"   },
};

const categoryColors: Record<string, string> = {
  development: "#6366f1", design: "#ec4899", marketing: "#f59e0b",
  writing: "#14b8a6", consulting: "#8b5cf6",
};

export default function WorkPage() {
  // Mapping the backend `ClientRequirement` to this UI's Work type
  const [works,   setWorks]   = useState<any[]>([]);
  const [catFilter, setCat]   = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [search, setSearch]   = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", category:"development", budget:"", deadline:"", skills:"" });

  const load = async () => {
    try {
      const { fetchWork } = await import("../../lib/api");
      const res = await fetchWork("dummy-token");
      setWorks(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = works.filter((w) => {
    const q = search.toLowerCase();
    if (q && !w.title.toLowerCase().includes(q) && !w.description.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    return true;
  });

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createWork } = await import("../../lib/api");
      await createWork("dummy-token", {
        title: form.title, 
        description: form.description,
        budget: parseInt(form.budget) || 0,
        timeline: form.deadline,
        skillsRequired: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      setForm({ title:"", description:"", category:"development", budget:"", deadline:"", skills:"" });
      setShowModal(false);
      await load(); // Reload from DB
    } catch (e) {
      console.error(e);
    }
  };

  const Stars = ({ rating }: { rating: number }) => (
    <span style={{ color: "#f59e0b", fontSize: 13 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))} {rating > 0 ? rating.toFixed(1) : ""}
    </span>
  );

  return (
    <>
      <Navigation />
      <main>
        {/* Page header */}
        <div className="page-header fade-in">
          <div>
            <div className="page-title">Work &amp; Projects</div>
            <div className="page-subtitle">{filtered.length} opportunities available</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Post Work
          </button>
        </div>

        {/* Filters */}
        <div className="card fade-in" style={{ marginBottom: 24, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search work…" style={{ width: 220, marginBottom: 0 }} />
            <div className="pill-filter" style={{ margin: 0, flex: 1, flexWrap: "wrap" }}>
              <button className={`pill ${catFilter === "all" ? "active" : ""}`} onClick={() => setCat("all")}>All</button>
              {categories.map((c) => <button key={c} className={`pill ${catFilter === c ? "active" : ""}`} onClick={() => setCat(c)} style={catFilter === c ? { background: categoryColors[c], borderColor: categoryColors[c] } : {}}>{c.charAt(0).toUpperCase()+c.slice(1)}</button>)}
            </div>
            <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} style={{ width: 160, marginBottom: 0 }}>
              <option value="all">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
          </div>
        </div>

        {/* Work cards */}
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💼</div><div className="empty-text">No work matches your search.</div></div>
        ) : (
          <div className="grid grid-2 fade-in" style={{ gap: 20 }}>
            {filtered.map((work) => {
              const sc = statusConfig[work.status] || { label: work.status, cls: "badge-neutral" };
              const accent = "#6366f1"; // Mock accent since backend lacks category
              return (
                <div key={work._id} className="card card-hover" style={{ marginBottom: 0, cursor: "pointer", borderTop: `3px solid ${accent}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <span className={`badge ${sc.cls}`}>{sc.label}</span>
                    <span className="badge" style={{ background: accent+"18", color: accent, fontWeight: 600 }}>
                      Development
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{work.title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                    {work.description.slice(0, 90)}…
                  </p>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    <span>💰 <strong style={{ color: "var(--text)" }}>${work.budget?.toLocaleString() || 0}</strong></span>
                    <span>📅 {work.timeline || "N/A"}</span>
                    <span>🏢 {"Anonymous"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {(work.skillsRequired || []).map((s: string) => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Stars rating={work.rating || 0} />
                    </div>
                    <button className="btn btn-primary btn-sm">Apply Now</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Post Work Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Post New Work</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>
            <form onSubmit={handlePost}>
              <div className="field"><label className="field-label">Title <span className="field-required">*</span></label><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="e.g. Build React Dashboard" required /></div>
              <div className="field"><label className="field-label">Description <span className="field-required">*</span></label><textarea rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Describe the work in detail…" required /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div className="field"><label className="field-label">Category</label><select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div className="field"><label className="field-label">Budget ($)</label><input type="number" value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})} placeholder="5000" required /></div>
                <div className="field"><label className="field-label">Deadline</label><input type="date" value={form.deadline} onChange={(e)=>setForm({...form,deadline:e.target.value})} required /></div>
                <div className="field"><label className="field-label">Skills (comma-sep.)</label><input value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})} placeholder="React, Node.js" /></div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button type="submit" className="btn btn-primary btn-full">Post Work</button>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
