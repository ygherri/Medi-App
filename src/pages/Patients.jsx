import React, { useEffect, useState, useCallback } from 'react'
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/api'
import { Btn, Card, Modal, Field, Input, Toast, Loader, Empty } from '../components/UI'

const empty = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' }

function PatientForm({ initial = empty, onSubmit, loading }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Requis'
    if (!form.lastName.trim()) e.lastName = 'Requis'
    if (!form.email.trim()) e.email = 'Requis'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => { if (validate()) onSubmit(form) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Prénom *" error={errors.firstName}>
          <Input value={form.firstName} onChange={set('firstName')} placeholder="Alice" />
        </Field>
        <Field label="Nom *" error={errors.lastName}>
          <Input value={form.lastName} onChange={set('lastName')} placeholder="Martin" />
        </Field>
      </div>
      <Field label="Email *" error={errors.email}>
        <Input value={form.email} onChange={set('email')} placeholder="alice@example.com" type="email" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Téléphone">
          <Input value={form.phone} onChange={set('phone')} placeholder="0612345678" />
        </Field>
        <Field label="Date de naissance">
          <Input value={form.dateOfBirth} onChange={set('dateOfBirth')} type="date" />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </Btn>
      </div>
    </div>
  )
}

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // null | 'create' | {edit: patient} | {delete: patient}
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getPatients({ search: search || undefined, page, limit: 10 })
      .then(r => { setPatients(r.data.data); setPagination(r.data.pagination) })
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { load() }, [load])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await createPatient({ ...form, dateOfBirth: form.dateOfBirth || undefined, phone: form.phone || undefined })
      setModal(null); load()
      setToast({ message: 'Patient créé avec succès', type: 'success' })
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Erreur lors de la création', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await updatePatient(modal.edit.id, { ...form, dateOfBirth: form.dateOfBirth || undefined })
      setModal(null); load()
      setToast({ message: 'Patient modifié avec succès', type: 'success' })
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Erreur lors de la modification', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deletePatient(modal.delete.id)
      setModal(null); load()
      setToast({ message: 'Patient supprimé', type: 'info' })
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Erreur lors de la suppression', type: 'error' })
    } finally { setSaving(false) }
  }

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 960 }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Patients</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{pagination.total ?? 0} patient(s) enregistré(s)</p>
        </div>
        <Btn variant="primary" onClick={() => setModal('create')}>+ Nouveau patient</Btn>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍  Rechercher par nom, prénom ou email…"
          style={{
            width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 16px', fontSize: 14, color: 'var(--text)',
          }}
        />
      </div>

      {/* Table */}
      {loading ? <Loader /> : patients.length === 0 ? (
        <Empty icon="👤" message="Aucun patient trouvé" />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                {['Nom', 'Email', 'Téléphone', 'Date de naissance', 'RDV', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < patients.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>#{p.id}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 14 }}>{p.email}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 14 }}>{p.phone || '—'}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 14 }}>
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: 'rgba(79,156,249,0.1)', color: 'var(--accent)', borderRadius: 6, padding: '2px 10px', fontSize: 13 }}>
                      {p._count?.appointments ?? 0}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn size="sm" variant="ghost" onClick={() => setModal({ edit: p })}>✏️</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setModal({ delete: p })}>🗑️</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
              background: p === page ? 'var(--accent)' : 'var(--bg2)',
              color: p === page ? '#fff' : 'var(--text2)', cursor: 'pointer', fontSize: 14
            }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Nouveau patient" onClose={() => setModal(null)}>
          <PatientForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}

      {modal?.edit && (
        <Modal title="Modifier le patient" onClose={() => setModal(null)}>
          <PatientForm
            initial={{
              firstName: modal.edit.firstName,
              lastName: modal.edit.lastName,
              email: modal.edit.email,
              phone: modal.edit.phone || '',
              dateOfBirth: modal.edit.dateOfBirth ? modal.edit.dateOfBirth.split('T')[0] : '',
            }}
            onSubmit={handleUpdate}
            loading={saving}
          />
        </Modal>
      )}

      {modal?.delete && (
        <Modal title="Supprimer le patient" onClose={() => setModal(null)}>
          <div style={{ color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
            Voulez-vous vraiment supprimer <strong style={{ color: 'var(--text)' }}>{modal.delete.firstName} {modal.delete.lastName}</strong> ?
            <br />
            <span style={{ color: 'var(--danger)', fontSize: 13 }}>⚠️ Tous ses rendez-vous seront également supprimés.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Suppression…' : 'Supprimer'}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
