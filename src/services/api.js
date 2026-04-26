import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});
export const getPatients = (params) => api.get('/api/patients', { params })
export const getPatient = (id) => api.get(`/api/patients/${id}`);
export const createPatient = (data) => api.post("/api/patients", data);
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/api/patients/${id}`);
export const getPatientAppointments = (id, params) =>
  api.get(`/api/patients/${id}/appointments`, { params });
export const getAppointments = (params) => api.get("/api/appointments", { params });
export const getAppointment = (id) => api.get(`/api/appointments/${id}`);
export const createAppointment = (data) => api.post("/api/appointments", data);
export const updateAppointment = (id, data) =>
  api.put(`/api/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/api/appointments/${id}`);
export default api
