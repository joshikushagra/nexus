"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const navItems = [
  { path: "/dashboard", label: "Dashboard",   icon: "🏠", roles: ["client", "developer"] },
  { path: "/clients",   label: "Clients",    icon: "👥", roles: ["client"] },
  { path: "/applications", label: "Applications", icon: "📩", roles: ["client"] },
  { path: "/work",      label: "Work",        icon: "💼", roles: ["client", "developer"] },
  { path: "/developer", label: "My Projects", icon: "💻", roles: ["developer"] },
  { path: "/forum",     icon: "💬", label: "Forum",     roles: ["client", "developer"] },
  { path: "/profile",   icon: "👤", label: "Profile",   roles: ["client", "developer"] },
];

type GitHubUser = { id: number; login: string; avatar_url: string; html_url: string };
type Notification = { _id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string; link?: string };

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [initials, setInitials]   = useState("??");
  const [userName, setUserName]   = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole]   = useState<string>("client");

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // GitHub search state
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<GitHubUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef    = useRef<HTMLDivElement>(null);
  const searchInput  = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("client_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_uid");
    router.push("/login");
  };

  useEffect(() => {
    const name  = localStorage.getItem("user_name");
    const token = localStorage.getItem("client_token");
    const role  = localStorage.getItem("user_role") || "client";
    const uid   = localStorage.getItem("user_uid");

    setUserName(name);
    setIsLoggedIn(!!token);
    setUserRole(role);
    setInitials(getInitials(name || ""));

    if (token) {
      // 1. Fetch existing notifications
      const API = process.env.NEXT_PUBLIC_API_BASE_URL;
      fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(j => setNotifications(j.data || []));

      // 2. Setup Socket.io
      const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "", {
        transports: ["websocket"]
      });

      if (uid) {
        socket.emit("join_room", uid);
      }

      socket.on("notification_new", (newNotif: Notification) => {
        setNotifications(prev => [newNotif, ...prev]);
        // Optional: Play sound or toast
      });

      return () => { socket.disconnect(); };
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchResults([]);
        setSearchQuery("");
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus input when search bar opens
  useEffect(() => {
    if (searchOpen && searchInput.current) searchInput.current.focus();
  }, [searchOpen]);

  // Debounced GitHub API call
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res  = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=6`);
        const json = await res.json();
        setSearchResults(json.items || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const markAsRead = async (id: string, link?: string) => {
    try {
      const token = localStorage.getItem("client_token");
      const API = process.env.NEXT_PUBLIC_API_BASE_URL;
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev: Notification[]) => prev.map((n: Notification) => n._id === id ? { ...n, isRead: true } : n));
      if (link) router.push(link);
      setNotifOpen(false);
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  // Filter nav by role
  const visibleNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* ── Logo ── */}
        <Link href={userRole === "developer" ? "/developer" : "/dashboard"} className="nav-logo">
          <div className="nav-logo-mark">NX</div>
          <span className="nav-logo-name">Nexus</span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="nav-links">
          {visibleNav.map((item) => (
            <Link key={item.path} href={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* ── Right Actions ── */}
        <div className="nav-actions">

          {/* GitHub User Search */}
          <div ref={searchRef} style={{ position: "relative" }}>
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                title="Search GitHub users"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--r-md)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 13, fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.1)";
                  el.style.color = "var(--text)";
                }}
                onMouseOut={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.05)";
                  el.style.color = "var(--text-secondary)";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                GitHub
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ position: "relative" }}>
                  <svg
                    style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    ref={searchInput}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                    placeholder="Search GitHub users…"
                    style={{
                      width: 210,
                      paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                      background: "var(--bg-3)",
                      border: "1px solid var(--brand-500)",
                      borderRadius: "var(--r-md)",
                      color: "var(--text)",
                      fontSize: 13,
                      fontFamily: "var(--font)",
                      outline: "none",
                      boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
                    }}
                  />
                </div>
                <button
                  onClick={closeSearch}
                  style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 17, lineHeight: 1, padding: 2 }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search Results Dropdown */}
            {searchOpen && searchQuery.trim() && (searchLoading || searchResults.length > 0) && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 300,
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-lg)",
                minWidth: 270,
                boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
                overflow: "hidden",
                animation: "fadeInUp 0.18s var(--ease)",
              }}>
                <div style={{
                  padding: "7px 12px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}>
                  🐙 GitHub Users
                </div>

                {searchLoading ? (
                  <div style={{ padding: 20, textAlign: "center" }}>
                    <div className="spinner spinner-dark" style={{ margin: "0 auto" }} />
                  </div>
                ) : searchResults.map((user) => (
                  <a
                    key={user.id}
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", textDecoration: "none", transition: "background 0.15s" }}
                    onMouseOver={(e)  => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseOut={(e)   => (e.currentTarget.style.background = "transparent")}
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.login}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                        github.com/{user.login}
                      </div>
                    </div>
                    <svg style={{ flexShrink: 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                ))}

                {!searchLoading && searchResults.length === 0 && (
                  <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-tertiary)", textAlign: "center" }}>
                    No GitHub users found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          {isLoggedIn && (
            <div ref={notifRef} style={{ position: "relative" }}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ 
                  background: "none", border: "none", color: "var(--text-secondary)", 
                  cursor: "pointer", padding: 8, position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{ 
                    position: "absolute", top: 6, right: 6, width: 8, height: 8, 
                    background: "#ef4444", borderRadius: "50%", border: "2px solid var(--nav-bg)"
                  }} />
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: -10, width: 320,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)", boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                  zIndex: 1000, overflow: "hidden"
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && <span style={{ color: "var(--brand-400)", fontSize: 11 }}>{unreadCount} unread</span>}
                  </div>
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>No notifications yet</div>
                    ) : (
                      notifications.slice(0, 10).map((n: Notification) => (
                        <div 
                          key={n._id} 
                          onClick={() => markAsRead(n._id, n.link)}
                          style={{ 
                            padding: "12px 16px", borderBottom: "1px solid var(--border)", 
                            cursor: "pointer", background: n.isRead ? "transparent" : "rgba(99,102,241,0.05)",
                            transition: "background 0.2s"
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: n.isRead ? "var(--text-secondary)" : "var(--text)" }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout / Sign In */}
          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderRadius: "var(--r-sm)",
                }}
              >
                Logout
              </button>
              <div className="nav-avatar" title={userName || "Your profile"}>{initials}</div>
            </>
          ) : (
            <Link
              href="/login"
              className="btn btn-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", color: "white", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: "var(--r-sm)", textDecoration: "none" }}
            >
              Sign In
            </Link>
          )}

          {/* Hamburger */}
          <div className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span style={menuOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="nav-mobile">
          {visibleNav.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
