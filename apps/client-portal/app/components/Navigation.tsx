"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Dashboard",  icon: "🏠" },
  { path: "/clients",   label: "Clients",   icon: "👥" },
  { path: "/work",      label: "Work",       icon: "💼" },
  { path: "/developer", label: "Developer",  icon: "💻" },
  { path: "/forum",     label: "Forum",      icon: "💬" },
  { path: "/profile",   label: "Profile",    icon: "👤" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [initials, setInitials] = useState("??");

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
    router.push("/login");
  };

  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const token = localStorage.getItem("client_token");
    setUserName(name);
    setIsLoggedIn(!!token);
    setInitials(getInitials(name || ""));
  }, []);

  return (
    <nav className="nav" style={{ position: "sticky" }}>
      <div className="nav-inner">
        {/* Logo always goes back to landing */}
        <Link href="/" className="nav-logo">
          <div className="nav-logo-mark">NX</div>
          <span className="nav-logo-name">Nexus</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="nav-actions">
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
                  borderRadius: "var(--r-sm)"
                }}
              >
                Logout
              </button>
              <div className="nav-avatar" title={userName || "Your profile"}>{initials}</div>
            </>
          ) : (
            <Link href="/login" className="btn btn-sm" style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", color: "white", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: "var(--r-sm)", textDecoration: "none" }}>
              Sign In
            </Link>
          )}
          {/* Hamburger */}
          <div className="nav-hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <span style={open ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}} />
            <span style={open ? { opacity: 0 } : {}} />
            <span style={open ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setOpen(false)}
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
