import api from './api'

const BASE = '/api'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerSilabo = (idSeccion) =>
  api.get(`${BASE}/silabo/seccion/${idSeccion}`, h())

export const obtenerNotasSeccion = (idSeccion) =>
  api.get(`${BASE}/notas/seccion/${idSeccion}`, h())

export const obtenerNotasEstudiante = (idEstudiante, idSeccion) =>
  api.get(`${BASE}/notas/estudiante/${idEstudiante}/seccion/${idSeccion}`, h())

export const registrarNota = (data) =>
  api.post(`${BASE}/notas`, data, h())

export const obtenerSeccionesDocente = (idDocente) =>
  api.get(`${BASE}/notas/docente/${idDocente}/secciones`, h())
