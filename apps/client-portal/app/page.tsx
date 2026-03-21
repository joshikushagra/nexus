"use client";

import Link from "next/link";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

const kpis = [
  { icon: "🚀", value: "120+", label: "Projects Delivered", color: "#6366f1" },
  { icon: "💻", value: "40+",  label: "Active Developers",  color: "#8b5cf6" },
  { icon: "🎯", value: "98%",  label: "Client Satisfaction",color: "#10b981" },
  { icon: "💬", value: "500+", label: "Forum Discussions",  color: "#f59e0b" },
];

const features = [
  { icon: "🔗", title: "GitHub Integration",  desc: "Real-time org repos, commits, and member sync directly from your GitHub organization." },
  { icon: "📊", title: "Live Project Tracking", desc: "Developers update progress with notes and repo links. Clients see it instantly." },
  { icon: "👥", title: "Role-Based Access",    desc: "Admins manage everything. Devs and clients see only what's relevant to them." },
  { icon: "💼", title: "Work Marketplace",     desc: "Clients post requirements, developers apply — a streamlined hiring loop." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #06060f 0%, #0c0c22 50%, #0a0f1e 100%)", color: "white", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(99,102,241,0.12)", backdropFilter: "blur(16px)", background: "rgba(6,6,15,0.85)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #4338ca)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "white" }}>NX</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>Nexus</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={`${ADMIN_URL}/login`}
              style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.2s", cursor: "pointer" }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.12)"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Admin Login
            </a>
            <Link href="/login"
              style={{ padding: "7px 16px", borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #4338ca)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 24px 80px", textAlign: "center", position: "relative" }}>
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", width: 700, height: 420, background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, background: "rgba(99,102,241,0.1)", fontSize: 12.5, color: "#a5b4fc", fontWeight: 600, marginBottom: 28, letterSpacing: 0.4 }}>
            ✦ The Developer & Client Command Center
          </div>
          <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.07, letterSpacing: "-2px", marginBottom: 22, background: "linear-gradient(135deg, #fff 30%, rgba(165,180,252,0.75) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Build Together.<br />Deliver Faster.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Nexus connects developers, clients, and admins on one platform — with live project tracking, GitHub integration, and a built-in work marketplace.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/login"
              style={{ padding: "13px 30px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4338ca)", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 0 32px rgba(99,102,241,0.45)", transition: "transform 0.15s" }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              Get Started — It's Free
            </Link>
            <a href="#about"
              style={{ padding: "13px 30px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 15, textDecoration: "none", cursor: "pointer" }}>
              Learn More ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16,
              padding: "28px 24px", textAlign: "center", backdropFilter: "blur(8px)",
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseOver={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = k.color + "55"; el.style.transform = "translateY(-4px)"; }}
              onMouseOut={(e)  => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{k.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: k.color, letterSpacing: "-1px", marginBottom: 6 }}>{k.value}</div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section id="about" style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#6366f1", textTransform: "uppercase", marginBottom: 14 }}>About Nexus</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.18, marginBottom: 20 }}>
              One platform for your entire development ecosystem
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15.5, lineHeight: 1.75, marginBottom: 24 }}>
              Nexus was built to eliminate the friction between clients, developers, and management. Instead of scattered tools, emails, and spreadsheets — everything lives here.
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14.5, lineHeight: 1.75, marginBottom: 32 }}>
              Developers update their progress and link their repos. Clients see delivery in real time. Admins manage users, tasks, and audits from a dedicated control panel. No more confusion about who's doing what.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/login" style={{ padding: "10px 22px", borderRadius: 9, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Developer / Client →
              </Link>
              <a href={`${ADMIN_URL}/login`} style={{ padding: "10px 22px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Admin Panel →
              </a>
            </div>
          </div>

          {/* Feature tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 18px" }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DUAL LOGIN CTA ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* User Portal Card */}
          <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 20, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(40px)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg, #6366f1, #4338ca)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>👤</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>Developer & Client</div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, marginBottom: 28 }}>
                Browse projects, post work opportunities, update your progress, manage clients, and engage with the community.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {["Track project progress live", "Browse & apply for work", "Manage your client network", "Community forum access"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 16 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <Link href="/login"
                style={{ display: "inline-block", padding: "12px 26px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4338ca)", color: "white", fontWeight: 700, fontSize: 14.5, textDecoration: "none", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
                Enter Portal →
              </Link>
            </div>
          </div>

          {/* Admin Panel Card */}
          <div style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.02) 100%)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 20, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(239,68,68,0.08)", filter: "blur(40px)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg, #ef4444, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>🛡️</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>Admin Panel</div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, marginBottom: 28 }}>
                Full control over users, projects, billing, and system settings. Restricted to authorized administrators only.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {["Manage all users & roles", "View complete audit logs", "Create & assign projects", "GitHub org management"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 16 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <a href={`${ADMIN_URL}/login`}
                style={{ display: "inline-block", padding: "12px 26px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #b91c1c)", color: "white", fontWeight: 700, fontSize: 14.5, textDecoration: "none", boxShadow: "0 0 24px rgba(239,68,68,0.3)" }}>
                Admin Login →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "30px 24px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
        <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>Nexus</span> — Built for teams that ship.
      </footer>
    </div>
  );
}
