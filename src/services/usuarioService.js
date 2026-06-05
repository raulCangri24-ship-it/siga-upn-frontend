import api from './api'

const BASE = '/api/usuarios'

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

export const listarUsuarios = () =>
  api.get(BASE, getHeaders())

export const crearUsuario = (data) =>
  api.post(BASE, data, getHeaders())

export const editarUsuario = (id, data) =>
  api.put(`${BASE}/${id}`, data, getHeaders())

export const cambiarEstado = (id, estado) =>
  api.patch(`${BASE}/${id}/estado`, { estado }, getHeaders())

export const cargarCsv = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`${BASE}/csv`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    }
  })
}