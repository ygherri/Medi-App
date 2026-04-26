// src/api.js
const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// Patients
export const api = {
  // Health
  health: () => fetch('/health').then(r => r.json()),

  // Patients
  getPatients: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/patients${q ? '?' + q : ''}`)
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (body) => request('/patients', { method: 'POST', body: JSON.stringify(body) }),
  updatePatient: (id, body) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
  getPatientAppointments: (id) => request(`/patients/${id}/appointments`),

  // Appointments
  getAppointments: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/appointments${q ? '?' + q : ''}`)
  },
  getAppointment: (id) => request(`/appointments/${id}`),
  createAppointment: (body) => request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  updateAppointment: (id, body) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
}
