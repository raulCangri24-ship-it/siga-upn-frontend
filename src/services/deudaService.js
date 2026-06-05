import api from './api'

const BASE = '/api/deudas'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const verificarRestriccion = (idEstudiante) =>
  api.get(`${BASE}/estudiante/${idEstudiante}/verificar`, h())

export const listarDeudas = () =>
  api.get(BASE, h())

export const listarDeudasEstudiante = (idEstudiante) =>
  api.get(`${BASE}/estudiante/${idEstudiante}`, h())

export const registrarDeuda = (data) =>
  api.post(BASE, data, h())

export const saldarDeuda = (idDeuda) =>
  api.patch(`${BASE}/${idDeuda}/saldar`, {}, h())
