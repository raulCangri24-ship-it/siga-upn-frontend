import api from './api'

const BASE = '/api/secciones'

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarSecciones = () =>
  api.get(BASE, getHeaders())

export const listarPorPeriodo = (idPeriodo) =>
  api.get(`${BASE}/periodo/${idPeriodo}`, getHeaders())

export const crearSeccion = (data) =>
  api.post(BASE, data, getHeaders())

export const editarSeccion = (id, data) =>
  api.put(`${BASE}/${id}`, data, getHeaders())

export const eliminarSeccion = (id) =>
  api.delete(`${BASE}/${id}`, getHeaders())