import axios from 'axios'

const BASE = 'http://localhost:8080/api/deudas'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const verificarRestriccion = (idEstudiante) =>
  axios.get(`${BASE}/estudiante/${idEstudiante}/verificar`, h())

export const listarDeudas = () =>
  axios.get(BASE, h())

export const listarDeudasEstudiante = (idEstudiante) =>
  axios.get(`${BASE}/estudiante/${idEstudiante}`, h())

export const registrarDeuda = (data) =>
  axios.post(BASE, data, h())

export const saldarDeuda = (idDeuda) =>
  axios.patch(`${BASE}/${idDeuda}/saldar`, {}, h())
