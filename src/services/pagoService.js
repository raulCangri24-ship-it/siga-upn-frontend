import axios from 'axios'

const BASE = 'http://localhost:8080/api/pagos'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarTodosPagos = () =>
  axios.get(BASE, h())

export const listarPagosPorEstudiante = (idEstudiante) =>
  axios.get(`${BASE}/estudiante/${idEstudiante}`, h())

export const registrarPago = (data) =>
  axios.post(BASE, data, h())

export const anularPago = (idPago) =>
  axios.patch(`${BASE}/${idPago}/anular`, {}, h())

export const crearPlanPago = (data) =>
  axios.post(`${BASE}/plan`, data, h())
