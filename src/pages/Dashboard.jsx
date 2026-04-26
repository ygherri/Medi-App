import React, { useEffect, useState } from 'react'
import { getPatients, getAppointments } from '../services/api'
import { Card, Badge, Loader } from '../components/UI'
import { Link } from 'react-router-dom'

function StatCard({ icon, label, value, color, to }) {
  const inner = (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontFamily: 'DM Serif Display', color }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
      </div>
    </Card>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPatients({ limit: 1 }), getAppointments({ limit: 100 })])
      .then(([pRes, aRes]) => {
        const appts = aRes.data.data
        const now = new Date()
        const todayStr = now.toDateString()
        setStats({
          totalPatients: pRes.data.pagination.total,
          totalAppts: aRes.data.pagination.total,
          today: appts.filter(a => new Date(a.startTime).toDateString() === todayStr).length,
          upcoming: appts.filter(a => new Date(a.startTime) > now && a.status !== 'CANCELLED').length,
          cancelled: appts.filter(a => a.status === 'CANCELLED').length,
          completed: appts.filter(a => a.status === 'COMPLETED').length,
        })
        setUpcoming(appts.filter(a => new Date(a.startTime) > now && a.status !== 'CANCELLED').sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).slice(0, 5))
      }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div
      className="fade-in"
      style={{ padding: 32, maxWidth: "100%", height: "100%" }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: "var(--text2)", fontSize: 14 }}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <StatCard
          icon="👤"
          label="Patients total"
          value={stats?.totalPatients ?? 0}
          color="var(--accent)"
          to="/patients"
        />
        <StatCard
          icon="📅"
          label="Rendez-vous total"
          value={stats?.totalAppts ?? 0}
          color="var(--accent2)"
          to="/appointments"
        />
        <StatCard
          icon="🕐"
          label="Aujourd'hui"
          value={stats?.today ?? 0}
          color="var(--accent3)"
        />
        <StatCard
          icon="⏳"
          label="À venir"
          value={stats?.upcoming ?? 0}
          color="#a78bfa"
        />
        <StatCard
          icon="✅"
          label="Effectués"
          value={stats?.completed ?? 0}
          color="var(--accent2)"
        />
        <StatCard
          icon="❌"
          label="Annulés"
          value={stats?.cancelled ?? 0}
          color="var(--danger)"
        />
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Prochains rendez-vous</h2>
      {upcoming.length === 0 ? (
        <Card>
          <p
            style={{ color: "var(--text3)", textAlign: "center", padding: 24 }}
          >
            Aucun rendez-vous à venir
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map((a) => (
            <Card
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--bg3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {new Date(a.startTime).getDate()}
                </span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>
                  {new Date(a.startTime)
                    .toLocaleDateString("fr-FR", { month: "short" })
                    .toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>
                  {a.patient
                    ? `${a.patient.firstName} ${a.patient.lastName}`
                    : `Patient #${a.patientId}`}
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>
                  {a.doctorName} ·{" "}
                  {new Date(a.startTime).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(a.endTime).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {a.reason && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text3)",
                      marginTop: 2,
                    }}
                  >
                    {a.reason}
                  </div>
                )}
              </div>
              <Badge status={a.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
