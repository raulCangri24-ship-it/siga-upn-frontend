import api from './api'

const BASE = '/api/notificaciones'
const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const listarNotificaciones = (idUsuario) =>
  api.get(`${BASE}/mis-notificaciones/${idUsuario}`, h())

export const contarNoLeidas = (idUsuario) =>
  api.get(`${BASE}/no-leidas/${idUsuario}`, h())

export const marcarLeida = (idNotificacion) =>
  api.patch(`${BASE}/${idNotificacion}/leer`, {}, h())

export const marcarTodasLeidas = (idUsuario) =>
  api.patch(`${BASE}/leer-todas/${idUsuario}`, {}, h())
