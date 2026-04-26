import React from 'react'

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500,
    borderRadius: 8, transition: 'all 0.15s ease',
    padding: size === 'sm' ? '6px 14px' : '10px 20px',
    fontSize: size === 'sm' ? 13 : 14,
    opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto',
  }
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    success: { background: 'var(--accent2)', color: '#fff' },
    danger:  { background: 'var(--danger)',  color: '#fff' },
    ghost:   { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' },
  }
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
    >{children}</button>
  )
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)', ...style
    }}>{children}</div>
  )
}

const badgeColors = {
  SCHEDULED: { bg: '#dbeafe', color: '#1d4ed8' },
  CONFIRMED:  { bg: '#ccfbf1', color: '#0f766e' },
  CANCELLED:  { bg: '#fee2e2', color: '#b91c1c' },
  COMPLETED:  { bg: '#f1f5f9', color: '#64748b' },
}
const badgeLabels = { SCHEDULED: 'Planifié', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé', COMPLETED: 'Effectué' }

export function Badge({ status }) {
  const c = badgeColors[status] || { bg: 'var(--bg3)', color: 'var(--text2)' }
  return (
    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {badgeLabels[status] || status}
    </span>
  )
}

export function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>}
      {children}
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

export function Input({ value, onChange, placeholder, type = 'text', style }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
        borderRadius: 8, padding: '9px 14px', fontSize: 14, width: '100%',
        transition: 'border-color 0.15s', ...style
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

export function Select({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={onChange}
      style={{
        background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
        borderRadius: 8, padding: '9px 14px', fontSize: 14, width: '100%', ...style
      }}
    >{children}</select>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,50,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 32, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)',
            borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: 'pointer'
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const colors = { success: 'var(--accent2)', error: 'var(--danger)', info: 'var(--accent)' }
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      background: 'var(--bg2)', border: `1px solid ${colors[type]}`,
      borderLeft: `4px solid ${colors[type]}`,
      borderRadius: 8, padding: '14px 20px',
      color: 'var(--text)', fontSize: 14, maxWidth: 380,
      boxShadow: 'var(--shadow)'
    }}>{message}</div>
  )
}

export function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function Empty({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p>{message}</p>
    </div>
  )
}
