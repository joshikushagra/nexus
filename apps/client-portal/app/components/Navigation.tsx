"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { path: "/clients", label: "Clients",  icon: "👥" },
  { path: "/work",    label: "Work",     icon: "💼" },
  { path: "/forum",   label: "Forum",    icon: "💬" },
  { path: "/profile", label: "Profile",  icon: "👤" },
  { path: "/about",   label: "About",    icon: "ℹ️" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");

  return (
    <nav className="nav" style={{ position: "sticky" }}>
      <div className="nav-inner">
        {/* Logo */}
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
          <div className="nav-avatar" title="Your profile">KJ</div>
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
