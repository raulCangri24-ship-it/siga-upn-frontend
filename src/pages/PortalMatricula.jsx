import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerCursosDisponibles, inscribir, cancelarMatricula, listarMisMatriculas } from '../services/matriculaService'
import { verificarRestriccion } from '../services/deudaService'
import './PortalMatricula.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarEstudiante from '../components/SidebarEstudiante'

const ID_PERIODO = 'PER001'

function PortalMatricula() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [tab, setTab] = useState('disponibles')
  const [cursosDisponibles, setCursosDisponibles] = useState([])
  const [misMatriculas, setMisMatriculas] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)
  const [filtro, setFiltro] = useState('')

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      const restriccion = await verificarRestriccion(idEstudiante)
      if (restriccion.data) {
        navigate('/estudiante/restriccion')
        return
      }
      const [disp, mis] = await Promise.all([
        obtenerCursosDisponibles(idEstudiante, ID_PERIODO),
        listarMisMatriculas(idEstudiante)
      ])
      setCursosDisponibles(disp.data)
      setMisMatriculas(mis.data)
    } catch {
      mostrarMensaje('Error al cargar datos de matrícula', 'error')
    }
  }

  const mostrarMensaje = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 5000)
  }

  const handleInscribir = async (seccion) => {
    if (!seccion.prerrequisitoCumplido) {
      mostrarMensaje(`No puedes inscribirte: ${seccion.mensajePrerrequisito}`, 'error')
      return
    }
    if (seccion.cuposDisponibles <= 0) {
      mostrarMensaje('No hay cupos disponibles en esta sección', 'error')
      return
    }
    setCargando(true)
    try {
      const req = {
        idMatricula: `MAT${Date.now().toString().slice(-10)}`,
        idEstudiante,
        idSeccion: seccion.idSeccion,
        idPeriodo: ID_PERIODO
      }
      await inscribir(req)
      mostrarMensaje(`✓ Inscripción confirmada en ${seccion.nombreCurso}`)
      cargarTodo()
      setTab('mis-matriculas')
    } catch (err) {
      mostrarMensaje(err.response?.data || 'Error al inscribirse', 'error')
    } finally {
      setCargando(false)
    }
  }

  const handleCancelar = async (idMatricula, nombreCurso) => {
    if (!window.confirm(`¿Cancelar matrícula en ${nombreCurso}?`)) return
    try {
      await cancelarMatricula(idMatricula)
      mostrarMensaje('Matrícula cancelada satisfactoriamente')
      cargarTodo()
    } catch {
      mostrarMensaje('Error al cancelar matrícula', 'error')
    }
  }

  const cursosFiltrados = cursosDisponibles.filter(c =>
    c.nombreCurso?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.codigo?.toLowerCase().includes(filtro.toLowerCase())
  )

  const matriculasActivas = misMatriculas.filter(m => m.estado !== 'CANCELADA')
  const totalCreditos = matriculasActivas.reduce((acc, m) => acc, 0)

  const menuItems = [
    { label: 'Inicio', ruta: '/dashboard/estudiante' },
    { label: 'Mi Matrícula', ruta: '/estudiante/matricula' },
    { label: 'Mis Notas', ruta: '/estudiante/notas' },
    { label: 'Horarios', ruta: '/estudiante/horarios' },
    { label: 'Mis Pagos', ruta: '/estudiante/pagos' },
    { label: 'Mis Accesos', ruta: '/estudiante/accesos' },
  ]

  return (
    <div className="pm-container">

      {/* NAVBAR */}
      <nav className="pm-navbar">
        <div className="pm-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="pm-logo-text">SIGA</span>
          <span className="pm-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="pm-navbar-right">
          <span className="pm-user">👤 {nombre}</span>
          <button className="pm-logout" onClick={() => {
            localStorage.clear()
            navigate('/login')
          }}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="pm-body">

        {/* SIDEBAR */}
        <SidebarEstudiante className="pm-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`pm-menu-item ${i === 1 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarEstudiante>

        {/* MAIN */}
        <main className="pm-main">

          {mensaje && (
            <div className={`pm-alert ${tipoMensaje === 'error' ? 'pm-alert-error' : 'pm-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="pm-header">
            <div>
              <h1 className="pm-title">Portal de Matrícula</h1>
              <p className="pm-subtitle">Periodo 2026-1 · {matriculasActivas.length} cursos inscritos</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="pm-tabs">
            <button
              className={`pm-tab ${tab === 'disponibles' ? 'active' : ''}`}
              onClick={() => setTab('disponibles')}>
              Cursos disponibles
              <span className="pm-tab-count">{cursosDisponibles.length}</span>
            </button>
            <button
              className={`pm-tab ${tab === 'mis-matriculas' ? 'active' : ''}`}
              onClick={() => setTab('mis-matriculas')}>
              Mis matrículas
              <span className="pm-tab-count">{matriculasActivas.length}</span>
            </button>
          </div>

          {/* Tab: Cursos disponibles */}
          {tab === 'disponibles' && (
            <div className="pm-content">
              <div className="pm-filtros">
                <input
                  className="pm-search"
                  placeholder="Buscar por curso o código..."
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
                />
              </div>

              {cursosFiltrados.length === 0 ? (
                <div className="pm-empty">No hay cursos disponibles para este periodo</div>
              ) : (
                <div className="pm-cursos-grid">
                  {cursosFiltrados.map(c => (
                    <div key={c.idSeccion}
                      className={`pm-curso-card ${!c.prerrequisitoCumplido ? 'bloqueado' : ''} ${c.cuposDisponibles === 0 ? 'sin-cupos' : ''}`}>

                      <div className="pm-curso-header">
                        <h3>{c.nombreCurso}</h3>
                        <span className="pm-curso-codigo">{c.codigo}</span>
                      </div>

                      <div className="pm-curso-info">
                        <div className="pm-info-item">
                          <span className="pm-info-label">Créditos</span>
                          <span className="pm-info-value">{c.creditos}</span>
                        </div>
                        <div className="pm-info-item">
                          <span className="pm-info-label">Ciclo</span>
                          <span className="pm-info-value">{c.ciclo}</span>
                        </div>
                        <div className="pm-info-item">
                          <span className="pm-info-label">Horario</span>
                          <span className="pm-info-value">{c.horario || '—'}</span>
                        </div>
                        <div className="pm-info-item">
                          <span className="pm-info-label">Aula</span>
                          <span className="pm-info-value">{c.aula}</span>
                        </div>
                      </div>

                      {/* Cupos */}
                      <div className="pm-cupos">
                        <div className="pm-cupos-bar">
                          <div
                            className="pm-cupos-fill"
                            style={{ width: `${(c.matriculados / c.capacidadMaxima) * 100}%` }}
                          />
                        </div>
                        <span className="pm-cupos-text">
                          {c.cuposDisponibles > 0
                            ? `${c.cuposDisponibles} cupos disponibles`
                            : '❌ Sin cupos'}
                        </span>
                      </div>

                      {/* Prerrequisito */}
                      <div className={`pm-prereq ${c.prerrequisitoCumplido ? 'ok' : 'fail'}`}>
                        {c.prerrequisitoCumplido ? '✓' : '✗'} {c.mensajePrerrequisito}
                      </div>

                      <button
                        className="pm-btn-inscribir"
                        disabled={!c.prerrequisitoCumplido || c.cuposDisponibles === 0 || cargando}
                        onClick={() => handleInscribir(c)}>
                        {!c.prerrequisitoCumplido
                          ? 'Sin prerrequisito'
                          : c.cuposDisponibles === 0
                            ? 'Sin cupos'
                            : 'Inscribirse'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Mis matrículas */}
          {tab === 'mis-matriculas' && (
            <div className="pm-content">
              {misMatriculas.length === 0 ? (
                <div className="pm-empty">No tienes matrículas registradas</div>
              ) : (
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Sección</th>
                        <th>Horario</th>
                        <th>Aula</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misMatriculas.map(m => (
                        <tr key={m.idMatricula}>
                          <td><strong>{m.curso}</strong></td>
                          <td>{m.seccion}</td>
                          <td>{m.horario}</td>
                          <td>{m.aula}</td>
                          <td>
                            <span className={`pm-badge ${m.estado === 'CONFIRMADA' ? 'badge-confirmada' : m.estado === 'CANCELADA' ? 'badge-cancelada' : 'badge-pendiente'}`}>
                              {m.estado}
                            </span>
                          </td>
                          <td>{m.fechaMatricula}</td>
                          <td>
                            {m.estado !== 'CANCELADA' && (
                              <button className="pm-btn-cancelar"
                                onClick={() => handleCancelar(m.idMatricula, m.curso)}>
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default PortalMatricula