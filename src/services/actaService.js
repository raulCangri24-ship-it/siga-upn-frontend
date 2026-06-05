import axios from 'axios'

const BASE = 'http://localhost:8080/api/actas'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarActas = () =>
  axios.get(BASE, h())

export const generarActa = (idSeccion, idDocente) =>
  axios.post(`${BASE}/generar`, { idSeccion, idDocente }, h())

export const cerrarActa = (idActa) =>
  axios.patch(`${BASE}/${idActa}/cerrar`, {}, h())
