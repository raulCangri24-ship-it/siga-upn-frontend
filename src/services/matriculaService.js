import api from './api'

const BASE = '/api/matriculas'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerCursosDisponibles = (idEstudiante, idPeriodo) =>
  api.get(`${BASE}/disponibles/${idEstudiante}/${idPeriodo}`, h())

export const inscribir = (data) =>
  api.post(BASE, data, h())

export const cancelarMatricula = (id) =>
  api.patch(`${BASE}/${id}/cancelar`, {}, h())

export const listarMisMatriculas = (idEstudiante) =>
  api.get(`${BASE}/estudiante/${idEstudiante}`, h())