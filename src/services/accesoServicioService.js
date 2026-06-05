import api from './api'

const BASE = '/api/accesos'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const obtenerAccesosEstudiante = (idEstudiante) =>
  api.get(`${BASE}/estudiante/${idEstudiante}`, h())

export const provisionarAccesos = (data) =>
  api.post(`${BASE}/provisionar`, data, h())

export const reintentarAccesos = () =>
  api.post(`${BASE}/reintentar`, {}, h())

export const suspenderAccesos = (idEstudiante, tipo) =>
  api.patch(`${BASE}/suspender/${idEstudiante}`, { tipo }, h())

export const rehabilitarAccesos = (idEstudiante) =>
  api.patch(`${BASE}/rehabilitar/${idEstudiante}`, {}, h())
