import api from './api'

const BASE = '/api/pagos'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarTodosPagos = () =>
  api.get(BASE, h())

export const listarPagosPorEstudiante = (idEstudiante) =>
  api.get(`${BASE}/estudiante/${idEstudiante}`, h())

export const registrarPago = (data) =>
  api.post(BASE, data, h())

export const anularPago = (idPago) =>
  api.patch(`${BASE}/${idPago}/anular`, {}, h())

export const crearPlanPago = (data) =>
  api.post(`${BASE}/plan`, data, h())
