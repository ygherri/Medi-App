import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", icon: "◈", label: "Dashboard" },
  { to: "/patients", icon: "◉", label: "Patients" },
  { to: "/appointments", icon: "◷", label: "Rendez-vous" },
];

function StethoscopeLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: 10,
        background: "linear-gradient(135deg, #2563eb, #0d9488)",
        padding: 6,
      }}
    >
      <path
        d="M9 8 C9 8, 8 13, 8 16 C8 20, 11 23, 15 23"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 8 C18 8, 19 13, 19 16 C19 20, 16 23, 15 23"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 23 L15 27"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle
        cx="15"
        cy="29.5"
        r="3"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="9" cy="7.5" r="1.8" fill="white" />
      <circle cx="18" cy="7.5" r="1.8" fill="white" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 0",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        boxShadow: "2px 0 12px rgba(30,40,90,0.05)",
      }}
    >
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StethoscopeLogo />
          <div>
            <div
              style={{
                fontFamily: "DM Serif Display",
                fontSize: 17,
                color: "var(--text)",
              }}
            >
              MediApp
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>
              Gestion médicale
            </div>
          </div>
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "0 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 8,
              color: isActive ? "var(--accent)" : "var(--text2)",
              background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: "all 0.15s",
              textDecoration: "none",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.getAttribute("aria-current"))
                e.currentTarget.style.background = "var(--bg3)";
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.getAttribute("aria-current"))
                e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          MediApp v1.0
        </div>
      </div>
    </aside>
  );
}
