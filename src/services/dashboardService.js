import api from './api'

const BASE = '/api/dashboard'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const getDashboardEstudiantil = () => api.get(`${BASE}/estudiantil`, h())
export const getDashboardDocente    = () => api.get(`${BASE}/docente`, h())
export const getDashboardRector     = () => api.get(`${BASE}/rector`, h())
