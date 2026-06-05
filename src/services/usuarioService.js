import axios from 'axios'

const BASE = 'http://localhost:8080/api/usuarios'

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

export const listarUsuarios = () =>
  axios.get(BASE, getHeaders())

export const crearUsuario = (data) =>
  axios.post(BASE, data, getHeaders())

export const editarUsuario = (id, data) =>
  axios.put(`${BASE}/${id}`, data, getHeaders())

export const cambiarEstado = (id, estado) =>
  axios.patch(`${BASE}/${id}/estado`, { estado }, getHeaders())

export const cargarCsv = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${BASE}/csv`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    }
  })
}