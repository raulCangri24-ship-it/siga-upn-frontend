import axios from 'axios'

const BASE = 'http://localhost:8080/api'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerSilabo = (idSeccion) =>
  axios.get(`${BASE}/silabo/seccion/${idSeccion}`, h())

export const obtenerNotasSeccion = (idSeccion) =>
  axios.get(`${BASE}/notas/seccion/${idSeccion}`, h())

export const obtenerNotasEstudiante = (idEstudiante, idSeccion) =>
  axios.get(`${BASE}/notas/estudiante/${idEstudiante}/seccion/${idSeccion}`, h())

export const registrarNota = (data) =>
  axios.post(`${BASE}/notas`, data, h())

export const obtenerSeccionesDocente = (idDocente) =>
  axios.get(`${BASE}/notas/docente/${idDocente}/secciones`, h())
