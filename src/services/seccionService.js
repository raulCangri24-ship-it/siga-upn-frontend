import axios from 'axios'

const BASE = 'http://localhost:8080/api/secciones'

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarSecciones = () =>
  axios.get(BASE, getHeaders())

export const listarPorPeriodo = (idPeriodo) =>
  axios.get(`${BASE}/periodo/${idPeriodo}`, getHeaders())

export const crearSeccion = (data) =>
  axios.post(BASE, data, getHeaders())

export const editarSeccion = (id, data) =>
  axios.put(`${BASE}/${id}`, data, getHeaders())

export const eliminarSeccion = (id) =>
  axios.delete(`${BASE}/${id}`, getHeaders())