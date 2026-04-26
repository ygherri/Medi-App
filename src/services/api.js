import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});
export const getPatients = (params) => api.get('/patients', { params })
export const getPatient = (id) => api.get(`/patients/${id}`)
export const createPatient = (data) => api.post('/patients', data)
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data)
export const deletePatient = (id) => api.delete(`/patients/${id}`)
export const getPatientAppointments = (id, params) => api.get(`/patients/${id}/appointments`, { params })
export const getAppointments = (params) => api.get('/appointments', { params })
export const getAppointment = (id) => api.get(`/appointments/${id}`)
export const createAppointment = (data) => api.post('/appointments', data)
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data)
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`)
export default api
