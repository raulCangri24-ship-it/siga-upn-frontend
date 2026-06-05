import axios from 'axios'

const BASE = 'http://localhost:8080/api/dashboard'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const getDashboardEstudiantil = () => axios.get(`${BASE}/estudiantil`, h())
export const getDashboardDocente    = () => axios.get(`${BASE}/docente`, h())
export const getDashboardRector     = () => axios.get(`${BASE}/rector`, h())
