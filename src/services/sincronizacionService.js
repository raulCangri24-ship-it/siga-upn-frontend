import axios from 'axios'

const BASE = 'http://localhost:8080/api/sync'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const obtenerEstadoEstudiante = (idEstudiante) =>
  axios.get(`${BASE}/estado/${idEstudiante}`, h())

export const activarRestriccion = (data) =>
  axios.post(`${BASE}/activar`, data, h())

export const levantarRestriccion = (idRestriccion) =>
  axios.post(`${BASE}/levantar/${idRestriccion}`, {}, h())

export const ejecutarSincronizacion = () =>
  axios.post(`${BASE}/ejecutar`, {}, h())
