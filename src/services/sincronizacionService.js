import api from './api'

const BASE = '/api/sync'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const obtenerEstadoEstudiante = (idEstudiante) =>
  api.get(`${BASE}/estado/${idEstudiante}`, h())

export const activarRestriccion = (data) =>
  api.post(`${BASE}/activar`, data, h())

export const levantarRestriccion = (idRestriccion) =>
  api.post(`${BASE}/levantar/${idRestriccion}`, {}, h())

export const ejecutarSincronizacion = () =>
  api.post(`${BASE}/ejecutar`, {}, h())
