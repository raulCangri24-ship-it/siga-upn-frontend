import axios from 'axios'

const h = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const listarDocentes = () =>
  axios.get('http://localhost:8080/api/usuarios', h())

export const listarAulas = () =>
  axios.get('http://localhost:8080/api/aulas', h())

export const listarCursos = () =>
  axios.get('http://localhost:8080/api/cursos', h())

export const listarPeriodos = () =>
  axios.get('http://localhost:8080/api/periodos', h())