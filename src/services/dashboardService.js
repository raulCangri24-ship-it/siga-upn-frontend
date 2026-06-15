import api from './api'

const BASE = '/api/dashboard'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const getDashboardEstudiantil = () => api.get(`${BASE}/estudiantil`, h())
export const getDashboardDocente = (periodo = 'PER001') => api.get(`${BASE}/docente?periodo=${periodo}`, h())
export const getDashboardRector  = (periodo = 'PER001') => api.get(`${BASE}/rector?periodo=${periodo}`, h())
