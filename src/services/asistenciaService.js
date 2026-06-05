import api from './api'

const BASE = '/api'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const registrarAsistencia = (data) =>
  api.post(`${BASE}/asistencia`, data, h())

export const listarAsistenciaPorFecha = (idSeccion, fecha) =>
  api.get(`${BASE}/asistencia/seccion/${idSeccion}/fecha/${fecha}`, h())

export const listarAsistenciaEstudiante = (idEstudiante, idSeccion) =>
  api.get(`${BASE}/asistencia/estudiante/${idEstudiante}/seccion/${idSeccion}`, h())

export const listarMateriales = (idSeccion) =>
  api.get(`${BASE}/materiales/seccion/${idSeccion}`, h())

export const publicarMaterial = (data) =>
  api.post(`${BASE}/materiales`, data, h())

export const eliminarMaterial = (id) =>
  api.delete(`${BASE}/materiales/${id}`, h())