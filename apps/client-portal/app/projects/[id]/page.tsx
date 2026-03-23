"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { io, Socket } from "socket.io-client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
};

type Message = {
  _id: string;
  senderUID: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat">("tasks");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token) { router.push("/login"); return; }

    const fetchData = async () => {
      try {
        const [pRes, tRes, mRes] = await Promise.all([
          fetch(`${API}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/tasks?projectId=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/chat/history/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const pJson = await pRes.json();
        const tJson = await tRes.json();
        const mJson = await mRes.json();

        setProject(pJson.data);
        setTasks(tJson.data || []);
        setMessages(mJson.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket.io for Chat
    const socket = io(API || "", { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join_room", id);
    socket.on("message_new", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => { socket.disconnect(); };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("client_token");
      const res = await fetch(`${API}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatRoomId: id, content: newMessage }),
      });
      if (res.ok) setNewMessage("");
    } catch (e) { console.error(e); }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const token = localStorage.getItem("client_token");
      await fetch(`${API}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="spinner-fixed"><div className="spinner" /></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <>
      <Navigation />
      <main className="fade-in" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div className="card" style={{ marginBottom: 24, padding: "30px 40px", background: "linear-gradient(135deg, #0b0b1a 0%, #1a1a2e 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8 }}>{project.title}</h1>
              <p style={{ color: "var(--text-secondary)", maxWidth: 700 }}>{project.description}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: "var(--brand-400)" }}>{project.progress}%</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          <button onClick={() => setActiveTab("tasks")} style={{ background: "none", border: "none", color: activeTab === "tasks" ? "white" : "var(--text-tertiary)", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>Tasks</button>
          <button onClick={() => setActiveTab("chat")} style={{ background: "none", border: "none", color: activeTab === "chat" ? "white" : "var(--text-tertiary)", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>Team Chat</button>
        </div>

        {activeTab === "tasks" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
             {["todo", "in-progress", "review", "completed"].map((status) => (
                <div key={status} className="card" style={{ background: "rgba(255,255,255,0.02)", minHeight: 400 }}>
                  <h3 style={{ textTransform: "uppercase", fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", marginBottom: 16 }}>{status.replace("-", " ")}</h3>
                  <div style={{ display: "grid", gap: 12 }}>
                    {tasks.filter(t => t.status === status).map(task => (
                      <div key={task._id} className="card" style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "default" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{task.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>{task.description}</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {status !== "completed" && (
                            <button onClick={() => updateTaskStatus(task._id, status === "todo" ? "in-progress" : status === "in-progress" ? "review" : "completed")} className="btn btn-sm" style={{ padding: "4px 8px", fontSize: 10 }}>Move Forward →</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="card" style={{ height: "600px", display: "flex", flexDirection: "column", padding: 0 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg) => (
                <div key={msg._id} style={{ alignSelf: msg.senderUID === localStorage.getItem("user_uid") ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4, textAlign: msg.senderUID === localStorage.getItem("user_uid") ? "right" : "left" }}>{msg.senderName}</div>
                  <div style={{ 
                    padding: "10px 14px", borderRadius: 12, fontSize: 14,
                    background: msg.senderUID === localStorage.getItem("user_uid") ? "var(--brand-600)" : "var(--surface-2)",
                    color: "white"
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
              <input 
                className="input" 
                placeholder="Type a message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
