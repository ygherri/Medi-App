import React, { useEffect, useState, useCallback } from 'react'
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getPatients } from '../services/api'
import { Btn, Card, Badge, Modal, Field, Input, Select, Toast, Loader, Empty } from '../components/UI'

const emptyForm = { patientId: '', doctorName: '', reason: '', startTime: '', endTime: '', notes: '', status: 'SCHEDULED' }

function toDatetimeLocal(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 16)
}

function AppointmentForm({ initial = emptyForm, patients, onSubmit, loading, submitLabel = 'Enregistrer' }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.patientId) e.patientId = 'Requis'
    if (!form.doctorName.trim()) e.doctorName = 'Requis'
    if (!form.startTime) e.startTime = 'Requis'
    if (!form.endTime) e.endTime = 'Requis'
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime))
      e.endTime = "Doit être après l'heure de début"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Patient *" error={errors.patientId}>
        <Select value={form.patientId} onChange={set('patientId')}>
          <option value="">— Sélectionner un patient —</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </Select>
      </Field>
      <Field label="Médecin *" error={errors.doctorName}>
        <Input value={form.doctorName} onChange={set('doctorName')} placeholder="Dr. Bernard" />
      </Field>
      <Field label="Motif">
        <Input value={form.reason} onChange={set('reason')} placeholder="Consultation générale" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Début *" error={errors.startTime}>
          <Input value={form.startTime} onChange={set('startTime')} type="datetime-local" />
        </Field>
        <Field label="Fin *" error={errors.endTime}>
          <Input value={form.endTime} onChange={set('endTime')} type="datetime-local" />
        </Field>
      </div>
      <Field label="Statut">
        <Select value={form.status} onChange={set('status')}>
          <option value="SCHEDULED">Planifié</option>
          <option value="CONFIRMED">Confirmé</option>
          <option value="CANCELLED">Annulé</option>
          <option value="COMPLETED">Effectué</option>
        </Select>
      </Field>
      <Field label="Notes">
        <textarea value={form.notes} onChange={set('notes')} placeholder="Notes optionnelles…"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '9px 14px', fontSize: 14, width: '100%', resize: 'vertical', minHeight: 72, fontFamily: 'DM Sans' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="primary" onClick={() => { if (validate()) onSubmit(form) }} disabled={loading}>
          {loading ? 'Enregistrement…' : submitLabel}
        </Btn>
      </div>
    </div>
  )
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [pagination, setPagination] = useState({})
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', doctorName: '' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getAppointments({ page, limit: 10, status: filters.status || undefined, doctorName: filters.doctorName || undefined })
      .then(r => { setAppointments(r.data.data); setPagination(r.data.pagination) })
      .finally(() => setLoading(false))
  }, [filters, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { getPatients({ limit: 100 }).then(r => setPatients(r.data.data)) }, [])

  const setFilter = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1) }
  const formatTime = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await createAppointment({ patientId: parseInt(form.patientId), doctorName: form.doctorName, reason: form.reason || undefined, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(), notes: form.notes || undefined })
      setModal(null); load()
      setToast({ message: 'Rendez-vous créé avec succès', type: 'success' })
    } catch (e) {
      const msg = e.response?.data?.message || 'Erreur lors de la création'
      setToast({ message: e.response?.status === 409 ? '⚠️ ' + msg : msg, type: 'error' })
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await updateAppointment(modal.edit.id, { doctorName: form.doctorName, reason: form.reason || undefined, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(), status: form.status, notes: form.notes || undefined })
      setModal(null); load()
      setToast({ message: 'Rendez-vous modifié', type: 'success' })
    } catch (e) {
      const msg = e.response?.data?.message || 'Erreur'
      setToast({ message: e.response?.status === 409 ? '⚠️ ' + msg : msg, type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteAppointment(modal.delete.id)
      setModal(null); load()
      setToast({ message: 'Rendez-vous supprimé', type: 'info' })
    } catch (e) {
      setToast({ message: 'Erreur lors de la suppression', type: 'error' })
    } finally { setSaving(false) }
  }

  return (
    <div
      className="fade-in"
      style={{ padding: 32, maxWidth: "100%", height: "100%" }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Rendez-vous</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            {pagination.total ?? 0} rendez-vous au total
          </p>
        </div>
        <Btn variant="primary" onClick={() => setModal("create")}>
          + Nouveau RDV
        </Btn>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Select
          value={filters.status}
          onChange={setFilter("status")}
          style={{ width: 180 }}
        >
          <option value="">Tous les statuts</option>
          <option value="SCHEDULED">Planifié</option>
          <option value="CONFIRMED">Confirmé</option>
          <option value="CANCELLED">Annulé</option>
          <option value="COMPLETED">Effectué</option>
        </Select>
        <input
          value={filters.doctorName}
          onChange={setFilter("doctorName")}
          placeholder="🔍  Filtrer par médecin…"
          style={{
            flex: 1,
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 14,
            color: "var(--text)",
          }}
        />
      </div>

      {loading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <Empty icon="📅" message="Aucun rendez-vous trouvé" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {appointments.map((a) => (
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
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "var(--bg3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {new Date(a.startTime).getDate()}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                  }}
                >
                  {new Date(a.startTime).toLocaleDateString("fr-FR", {
                    month: "short",
                  })}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    {a.patient
                      ? `${a.patient.firstName} ${a.patient.lastName}`
                      : `Patient #${a.patientId}`}
                  </span>
                  <Badge status={a.status} />
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>
                  <span style={{ color: "var(--accent2)" }}>
                    {a.doctorName}
                  </span>
                  {" · "}
                  {formatDate(a.startTime)}
                  {" · "}
                  {formatTime(a.startTime)} – {formatTime(a.endTime)}
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
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => setModal({ edit: a })}
                >
                  ✏️
                </Btn>
                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() => setModal({ delete: a })}
                >
                  🗑️
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 20,
          }}
        >
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: p === page ? "var(--accent)" : "var(--bg2)",
                  color: p === page ? "#fff" : "var(--text2)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {modal === "create" && (
        <Modal title="Nouveau rendez-vous" onClose={() => setModal(null)}>
          <AppointmentForm
            patients={patients}
            onSubmit={handleCreate}
            loading={saving}
            submitLabel="Créer le RDV"
          />
        </Modal>
      )}

      {modal?.edit && (
        <Modal title="Modifier le rendez-vous" onClose={() => setModal(null)}>
          <AppointmentForm
            patients={patients}
            initial={{
              patientId: String(modal.edit.patientId),
              doctorName: modal.edit.doctorName,
              reason: modal.edit.reason || "",
              startTime: toDatetimeLocal(modal.edit.startTime),
              endTime: toDatetimeLocal(modal.edit.endTime),
              status: modal.edit.status,
              notes: modal.edit.notes || "",
            }}
            onSubmit={handleUpdate}
            loading={saving}
          />
        </Modal>
      )}

      {modal?.delete && (
        <Modal title="Supprimer le rendez-vous" onClose={() => setModal(null)}>
          <div
            style={{ color: "var(--text2)", marginBottom: 24, lineHeight: 1.8 }}
          >
            Supprimer le rendez-vous du{" "}
            <strong style={{ color: "var(--text)" }}>
              {formatDate(modal.delete.startTime)}
            </strong>{" "}
            avec{" "}
            <strong style={{ color: "var(--text)" }}>
              {modal.delete.doctorName}
            </strong>{" "}
            ?
            <br />
            <span style={{ fontSize: 13, color: "var(--danger)" }}>
              ⚠️ Cette action est irréversible.
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Annuler
            </Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Suppression…" : "Supprimer"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
