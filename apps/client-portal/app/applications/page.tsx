"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Application = {
  _id: string;
  projectId: { _id: string; title: string };
  applicantUID: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setApplications(j.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id: string, status: "accepted" | "rejected" | "shortlisted") => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("client_token");
      const res = await fetch(`${API}/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");

      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
      
      if (status === "accepted") {
        alert("Application accepted! A project has been created automatically.");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <Navigation />
      <main className="fade-in">
        <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, #0b0b1a 0%, #1a1a2e 100%)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>Applications</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Review developer applications for your requirements and hire the best talent.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="empty-state">
            <div className="spinner spinner-dark" />
          </div>
        ) : applications.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📩</div>
              <div className="empty-state-text">No applications received yet.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {applications.map((app) => (
              <div key={app._id} className="card" style={{ borderLeft: app.status === 'accepted' ? '4px solid #10b981' : '1px solid var(--border)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--brand-400)" }}>
                      {app.projectId?.title || "Unknown Requirement"}
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge badge-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'brand'}`}>
                    {app.status}
                  </span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>DEVELOPER MESSAGE:</div>
                  "{app.message}"
                </div>

                {app.status === "pending" || app.status === "shortlisted" ? (
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button 
                      onClick={() => handleStatusUpdate(app._id, "rejected")}
                      className="btn btn-sm"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                      disabled={!!processingId}
                    >
                      Reject
                    </button>
                    {app.status === "pending" && (
                      <button 
                        onClick={() => handleStatusUpdate(app._id, "shortlisted")}
                        className="btn btn-sm"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                        disabled={!!processingId}
                      >
                        Shortlist
                      </button>
                    )}
                    <button 
                      onClick={() => handleStatusUpdate(app._id, "accepted")}
                      className="btn btn-sm btn-primary"
                      disabled={!!processingId}
                    >
                      {processingId === app._id ? "Processing..." : "Hire Developer"}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
