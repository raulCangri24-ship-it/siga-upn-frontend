import axios from 'axios'

const BASE = 'http://localhost:8080/api/matriculas'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerCursosDisponibles = (idEstudiante, idPeriodo) =>
  axios.get(`${BASE}/disponibles/${idEstudiante}/${idPeriodo}`, h())

export const inscribir = (data) =>
  axios.post(BASE, data, h())

export const cancelarMatricula = (id) =>
  axios.patch(`${BASE}/${id}/cancelar`, {}, h())

export const listarMisMatriculas = (idEstudiante) =>
  axios.get(`${BASE}/estudiante/${idEstudiante}`, h())