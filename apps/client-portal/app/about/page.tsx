"use client";

import Navigation from "../components/Navigation";

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main>
        <div className="fade-in" style={{
          background: "linear-gradient(135deg, #050508 0%, #111120 100%)",
          borderRadius: "var(--r-xl)",
          padding: "60px 48px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center"
        }}>
          <div style={{ position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.08)", filter: "blur(60px)", pointerEvents: "none" }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px", borderRadius: 16, background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white", boxShadow: "0 12px 32px rgba(99,102,241,0.3)" }}>
              NX
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 16 }}>
              About Nexus
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.6 }}>
              The premium client and talent management ecosystem. We connect independent professionals with high-growth companies.
            </p>
          </div>
        </div>

        <div className="grid grid-3 fade-in" style={{ gap: 24, marginBottom: 32 }}>
          <div className="card" style={{ margin: 0, padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🎯</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Our Mission</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              To simplify the collaboration between top-tier talent and ambitious companies through a unified, elegant platform.
            </p>
          </div>
          
          <div className="card" style={{ margin: 0, padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🤝</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>For Clients</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Track project progress in real-time, manage budgets, and communicate seamlessly with your distributed team.
            </p>
          </div>
          
          <div className="card" style={{ margin: 0, padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>💻</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>For Developers</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Find high-quality work, manage your active assignments, and collaborate in the community forum.
            </p>
          </div>
        </div>

        <div className="card fade-in" style={{ padding: 48, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 24 }}>
            Join the Nexus ecosystem today as a client or developer.
          </p>
          <a href="/login" className="btn btn-primary btn-lg" style={{ display: "inline-flex" }}>
            Create an Account
          </a>
        </div>
      </main>
    </>
  );
}
