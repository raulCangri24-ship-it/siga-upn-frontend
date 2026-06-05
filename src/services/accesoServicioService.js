import axios from 'axios'

const BASE = 'http://localhost:8080/api/accesos'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const obtenerAccesosEstudiante = (idEstudiante) =>
  axios.get(`${BASE}/estudiante/${idEstudiante}`, h())

export const provisionarAccesos = (data) =>
  axios.post(`${BASE}/provisionar`, data, h())

export const reintentarAccesos = () =>
  axios.post(`${BASE}/reintentar`, {}, h())

export const suspenderAccesos = (idEstudiante, tipo) =>
  axios.patch(`${BASE}/suspender/${idEstudiante}`, { tipo }, h())

export const rehabilitarAccesos = (idEstudiante) =>
  axios.patch(`${BASE}/rehabilitar/${idEstudiante}`, {}, h())
