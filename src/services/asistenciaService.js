import axios from 'axios'

const BASE = 'http://localhost:8080/api'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const registrarAsistencia = (data) =>
  axios.post(`${BASE}/asistencia`, data, h())

export const listarAsistenciaPorFecha = (idSeccion, fecha) =>
  axios.get(`${BASE}/asistencia/seccion/${idSeccion}/fecha/${fecha}`, h())

export const listarAsistenciaEstudiante = (idEstudiante, idSeccion) =>
  axios.get(`${BASE}/asistencia/estudiante/${idEstudiante}/seccion/${idSeccion}`, h())

export const listarMateriales = (idSeccion) =>
  axios.get(`${BASE}/materiales/seccion/${idSeccion}`, h())

export const publicarMaterial = (data) =>
  axios.post(`${BASE}/materiales`, data, h())

export const eliminarMaterial = (id) =>
  axios.delete(`${BASE}/materiales/${id}`, h())