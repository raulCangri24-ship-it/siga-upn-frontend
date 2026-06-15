import api from './api'

const BASE = '/api/actas'
const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarActas = () =>
  api.get(BASE, h())

export const generarActa = (idSeccion, idDocente) =>
  api.post(`${BASE}/generar`, { idSeccion, idDocente }, h())

export const cerrarActa = (idActa) =>
  api.patch(`${BASE}/${idActa}/cerrar`, {}, h())

export const cerrarPorCoordinador = (idActa) =>
  api.put(`${BASE}/${idActa}/cerrar-coordinador`, {}, h())
