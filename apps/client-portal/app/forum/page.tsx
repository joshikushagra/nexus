"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

type Post = {
  id: string; title: string; content: string; author: string;
  initials: string; category: string; replies: number;
  views: number; likes: number; createdAt: string; isAnswered: boolean;
};

const categories = ["general", "tips", "questions", "showcase", "feedback"];
const catColors: Record<string, string> = {
  general: "#6366f1", tips: "#10b981", questions: "#f59e0b",
  showcase: "#8b5cf6", feedback: "#ef4444",
};
const catBg: Record<string, string> = {
  general: "#eef2ff", tips: "#d1fae5", questions: "#fef3c7",
  showcase: "#ede9fe", feedback: "#fee2e2",
};
const avatarColors = ["avatar-brand","avatar-purple","avatar-blue","avatar-teal","avatar-orange","avatar-pink"];
const getAvc = (n: string) => avatarColors[n.charCodeAt(0) % avatarColors.length];

const MOCK: Post[] = [
  { id:"1", title:"Best practices for React performance optimization", content:"Looking for best practices to optimize React applications. What are the most effective techniques you use in production?", author:"Alex Developer", initials:"AD", category:"tips", replies:12, views:245, likes:45, createdAt:"2 hours ago", isAnswered:true },
  { id:"2", title:"Help needed: MongoDB connection issues in production", content:"Getting timeout errors when connecting to MongoDB Atlas. Anyone experienced this before?", author:"Sarah DevOps", initials:"SD", category:"questions", replies:8, views:156, likes:12, createdAt:"5 hours ago", isAnswered:false },
  { id:"3", title:"Showcase: Built a new design system from scratch", content:"Excited to share the new design system I built for our platform. Has tokens, components and documentation.", author:"Mike Designer", initials:"MD", category:"showcase", replies:23, views:512, likes:89, createdAt:"1 day ago", isAnswered:true },
  { id:"4", title:"Feature request: Dark mode support", content:"Would love to see dark mode support in the next release. Is this planned for Q2?", author:"Emma User", initials:"EU", category:"feedback", replies:15, views:289, likes:67, createdAt:"2 days ago", isAnswered:true },
  { id:"5", title:"How to structure large Next.js projects?", content:"Tips and strategies for organizing large-scale Next.js projects. What folder structure works best?", author:"Tom Lead", initials:"TL", category:"general", replies:18, views:421, likes:92, createdAt:"3 days ago", isAnswered:true },
];

export default function ForumPage() {
  const [posts,    setPosts]    = useState<Post[]>(MOCK);
  const [catFilter, setCat]     = useState("all");
  const [sortBy,   setSort]     = useState("newest");
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title:"", content:"", category:"general" });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filtered = posts
    .filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.views - a.views;
      if (sortBy === "trending") return b.likes - a.likes;
      return 0; // newest — mock data already ordered
    });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: Post = {
      id: Date.now().toString(), title: form.title, content: form.content,
      author: "You", initials: "YO", category: form.category,
      replies: 0, views: 0, likes: 0, createdAt: "just now", isAnswered: false,
    };
    setPosts([newPost, ...posts]);
    setForm({ title:"", content:"", category:"general" });
    setShowForm(false);
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setPosts(ps => ps.map(p => p.id===id ? {...p, likes: p.likes-1} : p)); }
      else               { next.add(id);    setPosts(ps => ps.map(p => p.id===id ? {...p, likes: p.likes+1} : p)); }
      return next;
    });
  };

  return (
    <>
      <Navigation />
      <main>
        {/* Header */}
        <div className="page-header fade-in">
          <div>
            <div className="page-title">Community Forum</div>
            <div className="page-subtitle">{posts.length} discussions · {posts.filter(p=>p.isAnswered).length} answered</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {showForm ? "Cancel" : "New Discussion"}
          </button>
        </div>

        {/* New post form */}
        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 24, borderColor: "var(--brand-200)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Start a Discussion</div>
            <form onSubmit={handleCreate}>
              <div className="field"><label className="field-label">Title <span className="field-required">*</span></label><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="What would you like to discuss?" required /></div>
              <div className="field"><label className="field-label">Category</label><select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
              <div className="field"><label className="field-label">Details <span className="field-required">*</span></label><textarea rows={4} value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})} placeholder="Provide context and details…" required /></div>
              <div style={{ display:"flex", gap:10 }}>
                <button type="submit" className="btn btn-primary">Post Discussion</button>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", marginBottom:20 }} className="fade-in">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search discussions…" style={{ width:220, marginBottom:0 }} />
          <div className="pill-filter" style={{ margin:0, flex:1 }}>
            <button className={`pill ${catFilter==="all"?"active":""}`} onClick={()=>setCat("all")}>All</button>
            {categories.map(c=>(
              <button key={c} className={`pill ${catFilter===c?"active":""}`} onClick={()=>setCat(c)}
                style={catFilter===c ? { background:catColors[c], borderColor:catColors[c], color:"white" } : {}}>
                {c.charAt(0).toUpperCase()+c.slice(1)}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e)=>setSort(e.target.value)} style={{ width:160, marginBottom:0 }}>
            <option value="newest">Newest</option>
            <option value="popular">Most Viewed</option>
            <option value="trending">Most Liked</option>
          </select>
        </div>

        {/* Thread list */}
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💬</div><div className="empty-text">No discussions match your search.</div></div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }} className="fade-in">
            {filtered.map((post) => (
              <div key={post.id} className="card thread-card" style={{ marginBottom:0, borderLeft:`4px solid ${catColors[post.category]}` }}>
                <div style={{ display:"flex", gap:14 }}>
                  {/* Avatar */}
                  <div className={`avatar avatar-md ${getAvc(post.author)}`} style={{ flexShrink:0, marginTop:2 }}>{post.initials}</div>
                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", gap:12, marginBottom:6, flexWrap:"wrap" }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, marginBottom:4, color:"var(--text)" }}>{post.title}</div>
                        <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
                          <strong>{post.author}</strong> · {post.createdAt}
                          {post.isAnswered && <span className="badge badge-success" style={{ marginLeft:8 }}>✓ Answered</span>}
                        </div>
                      </div>
                      <span className="badge" style={{ background:catBg[post.category], color:catColors[post.category], flexShrink:0 }}>
                        {post.category}
                      </span>
                    </div>
                    <p style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:12, lineHeight:1.55, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any, overflow:"hidden" }}>
                      {post.content}
                    </p>
                    <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ gap:5, color: likedIds.has(post.id) ? "var(--danger)" : "var(--text-secondary)", padding:"4px 8px" }}
                        onClick={() => toggleLike(post.id)}
                      >
                        {likedIds.has(post.id) ? "❤️" : "🤍"} {post.likes}
                      </button>
                      <span style={{ fontSize:13, color:"var(--text-secondary)" }}>💬 {post.replies} replies</span>
                      <span style={{ fontSize:13, color:"var(--text-secondary)" }}>👁 {post.views} views</span>
                      <button className="btn btn-secondary btn-sm" style={{ marginLeft:"auto" }}>Read More</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
