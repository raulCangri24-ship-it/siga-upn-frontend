import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarMisMatriculas } from '../services/matriculaService'
import { obtenerNotasEstudiante } from '../services/evaluacionService'
import './MisNotas.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarEstudiante from '../components/SidebarEstudiante'

function MisNotas() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [cursosConNotas, setCursosConNotas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const matriculasRes = await listarMisMatriculas(idEstudiante)
        const activas = (matriculasRes.data || []).filter(m => m.estado !== 'CANCELADA')

        const seccionesUnicas = activas.filter((v, i, arr) =>
          arr.findIndex(x => x.seccion === v.seccion) === i
        )

        const resultados = await Promise.all(
          activas
            .filter((v, i, arr) => arr.findIndex(x => x.seccion === v.seccion) === i)
            .map(async (m) => {
              try {
                const notasRes = await obtenerNotasEstudiante(idEstudiante, m.idSeccion)
                return {
                  nombreCurso: m.curso,
                  idSeccion: m.seccion || m.idSeccion,
                  periodo: m.periodo,
                  ...notasRes.data
                }
              } catch {
                return {
                  nombreCurso: m.curso,
                  idSeccion: m.seccion || m.idSeccion,
                  periodo: m.periodo,
                  notas: [],
                  promedio: 0,
                  estado: 'SIN NOTAS'
                }
              }
            })
        )
        setCursosConNotas(resultados)
      } catch {
        setCursosConNotas([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [idEstudiante])

  const colorEstado = (estado) => {
    if (estado === 'APROBADO') return 'mn-badge-aprobado'
    if (estado === 'DESAPROBADO') return 'mn-badge-desaprobado'
    return 'mn-badge-sin-notas'
  }

  const colorNota = (valor) => {
    if (valor === null || valor === undefined) return ''
    return parseFloat(valor) >= 11 ? 'mn-nota-ok' : 'mn-nota-mal'
  }

  const menuItems = [
    { label: 'Inicio',       ruta: '/dashboard/estudiante' },
    { label: 'Mi Matrícula', ruta: '/estudiante/matricula' },
    { label: 'Mis Notas',    ruta: '/estudiante/notas' },
    { label: 'Horarios',     ruta: null },
    { label: 'Mis Pagos',    ruta: '/estudiante/pagos' },
    { label: 'Mis Accesos',  ruta: '/estudiante/accesos' },
  ]

  return (
    <div className="mn-container">

      {/* NAVBAR */}
      <nav className="mn-navbar">
        <div className="mn-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="mn-logo-text">SIGA</span>
          <span className="mn-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="mn-navbar-right">
          <span className="mn-user">👤 {nombre}</span>
          <button className="mn-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="mn-body">

        {/* SIDEBAR */}
        <SidebarEstudiante className="mn-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`mn-menu-item ${i === 2 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarEstudiante>

        {/* MAIN */}
        <main className="mn-main">
          <div className="mn-header">
            <h1 className="mn-title">Mis Notas</h1>
            <p className="mn-subtitle">Consulta tus calificaciones por curso y periodo académico</p>
          </div>

          {cargando && (
            <div className="mn-cargando">
              <div className="mn-spinner" />
              <p>Cargando notas...</p>
            </div>
          )}

          {!cargando && cursosConNotas.length === 0 && (
            <div className="mn-empty">
              No tienes matrículas activas con notas registradas.
            </div>
          )}

          {!cargando && cursosConNotas.map((curso, idx) => (
            <div key={idx} className="mn-curso-card">

              <div className="mn-curso-header">
                <div>
                  <h2 className="mn-curso-nombre">{curso.nombreCurso || '—'}</h2>
                  <span className="mn-curso-meta">
                    Sección {curso.idSeccion} · Periodo {curso.periodo}
                  </span>
                </div>
                <div className="mn-promedio-wrap">
                  <div className={`mn-promedio-num ${curso.estado === 'APROBADO' ? 'aprobado' : curso.estado === 'DESAPROBADO' ? 'desaprobado' : ''}`}>
                    {curso.promedio > 0 ? parseFloat(curso.promedio).toFixed(2) : '—'}
                  </div>
                  <span className={`mn-badge ${colorEstado(curso.estado)}`}>{curso.estado}</span>
                </div>
              </div>

              {curso.notas && curso.notas.length > 0 ? (
                <div className="mn-notas-grid">
                  {curso.notas.map(n => (
                    <div key={n.idEvaluacion} className="mn-nota-item">
                      <div className="mn-nota-nombre">{n.nombreEvaluacion}</div>
                      <div className="mn-nota-tipo">{n.tipo} · {n.peso}%</div>
                      <div className={`mn-nota-valor ${colorNota(n.valor)}`}>
                        {n.valor !== null && n.valor !== undefined
                          ? parseFloat(n.valor).toFixed(2)
                          : <span className="mn-sin-nota">Sin nota</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mn-sin-evaluaciones">No hay evaluaciones configuradas para este curso.</p>
              )}
            </div>
          ))}

        </main>
      </div>
    </div>
  )
}

export default MisNotas
