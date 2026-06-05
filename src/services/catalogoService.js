import api from './api'

const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarDocentes = () =>
  api.get('/api/usuarios', h())

export const listarAulas = () =>
  api.get('/api/aulas', h())

export const listarCursos = () =>
  api.get('/api/cursos', h())

export const listarPeriodos = () =>
  api.get('/api/periodos', h())