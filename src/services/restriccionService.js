import api from './api'

const h = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const bloquearEstudiante = (idEstudiante, idDeuda) =>
  api.post('/api/restricciones/bloquear', { idEstudiante, idDeuda }, h())

export const desbloquearEstudiante = (idDeuda) =>
  api.post('/api/restricciones/desbloquear', { idDeuda }, h())
