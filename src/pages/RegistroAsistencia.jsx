import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarAsistencia, listarAsistenciaPorFecha } from '../services/asistenciaService'
import { listarMateriales, publicarMaterial, eliminarMaterial } from '../services/asistenciaService'
import { listarSecciones } from '../services/seccionService'
import './RegistroAsistencia.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarDocente from '../components/SidebarDocente'

const ESTADOS = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO']

function RegistroAsistencia() {
  const navigate = useNavigate()
  const idDocente = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [tab, setTab] = useState('asistencia')
  const [secciones, setSecciones] = useState([])
  const [idSeccionSel, setIdSeccionSel] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [modalidad, setModalidad] = useState('PRESENCIAL')
  const [registros, setRegistros] = useState([])
  const [materiales, setMateriales] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)
  const [formMaterial, setFormMaterial] = useState({
    idMaterial: '', titulo: '', tipo: 'DOCUMENTO', url: ''
  })
  const [mostrarFormMaterial, setMostrarFormMaterial] = useState(false)

  useEffect(() => { cargarSecciones() }, [])
  useEffect(() => {
    if (idSeccionSel) {
      cargarAsistencia()
      cargarMateriales()
    }
  }, [idSeccionSel, fecha])

  const cargarSecciones = async () => {
    try {
      const res = await listarSecciones()
      const misSeccciones = res.data.filter(s =>
        s.docente?.includes(nombre) || true)
      setSecciones(res.data)
      if (res.data.length > 0) setIdSeccionSel(res.data[0].idSeccion)
    } catch {
      mostrarMensaje('Error al cargar secciones', 'error')
    }
  }

  const cargarAsistencia = async () => {
    try {
      const res = await listarAsistenciaPorFecha(idSeccionSel, fecha)
      if (res.data.length > 0) {
        setRegistros(res.data.map(a => ({
          idEstudiante: a.idEstudiante,
          nombreEstudiante: a.nombreEstudiante,
          estado: a.estado
        })))
      } else {
        // Cargar estudiantes matriculados sin asistencia
        setRegistros([
          { idEstudiante: 'USR003', nombreEstudiante: 'Carlos Mendez', estado: 'PRESENTE' },
          { idEstudiante: 'USR004', nombreEstudiante: 'Ana Torres', estado: 'PRESENTE' },
          { idEstudiante: 'USR005', nombreEstudiante: 'Luis Flores', estado: 'PRESENTE' },
        ])
      }
    } catch {
      mostrarMensaje('Error al cargar asistencia', 'error')
    }
  }

  const cargarMateriales = async () => {
    try {
      const res = await listarMateriales(idSeccionSel)
      setMateriales(res.data)
    } catch {
      mostrarMensaje('Error al cargar materiales', 'error')
    }
  }

  const mostrarMensaje = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleEstado = (idEstudiante, estado) => {
    setRegistros(prev => prev.map(r =>
      r.idEstudiante === idEstudiante ? { ...r, estado } : r
    ))
  }

  const handleGuardarAsistencia = async () => {
    setCargando(true)
    try {
      await registrarAsistencia({
        idSeccion: idSeccionSel,
        idDocente,
        fecha,
        modalidad,
        registros: registros.map(r => ({
          idEstudiante: r.idEstudiante,
          estado: r.estado
        }))
      })
      mostrarMensaje('Asistencia registrada satisfactoriamente')
    } catch {
      mostrarMensaje('Error al registrar asistencia', 'error')
    } finally {
      setCargando(false)
    }
  }

  const handlePublicarMaterial = async (e) => {
    e.preventDefault()
    try {
      await publicarMaterial({
        ...formMaterial,
        idMaterial: `MAT${Date.now().toString().slice(-10)}`,
        idSeccion: idSeccionSel,
        idDocente
      })
      mostrarMensaje('Material publicado satisfactoriamente')
      setFormMaterial({ idMaterial:'', titulo:'', tipo:'DOCUMENTO', url:'' })
      setMostrarFormMaterial(false)
      cargarMateriales()
    } catch {
      mostrarMensaje('Error al publicar material', 'error')
    }
  }

  const handleEliminarMaterial = async (id) => {
    if (!window.confirm('¿Eliminar este material?')) return
    try {
      await eliminarMaterial(id)
      mostrarMensaje('Material eliminado satisfactoriamente')
      cargarMateriales()
    } catch {
      mostrarMensaje('Error al eliminar material', 'error')
    }
  }

  const colorEstado = (estado) => {
    if (estado === 'PRESENTE') return 'ra-estado-presente'
    if (estado === 'AUSENTE') return 'ra-estado-ausente'
    if (estado === 'TARDANZA') return 'ra-estado-tardanza'
    return 'ra-estado-justificado'
  }

  const iconoTipo = (tipo) => {
    if (tipo === 'VIDEO') return '🎥'
    if (tipo === 'ENLACE') return '🔗'
    if (tipo === 'PRESENTACION') return '📊'
    return '📄'
  }

  const menuItems = [
    { label: 'Inicio', ruta: '/dashboard/docente' },
    { label: 'Mis Cursos', ruta: null },
    { label: 'Evaluaciones', ruta: '/docente/evaluaciones' },
    { label: 'Asistencia', ruta: '/docente/asistencia' },
    { label: 'Actas', ruta: '/docente/actas' },
  ]

  return (
    <div className="ra-container">
      <nav className="ra-navbar">
        <div className="ra-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="ra-logo-text">SIGA</span>
          <span className="ra-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="ra-navbar-right">
          <span className="ra-user">👤 {nombre}</span>
          <button className="ra-logout" onClick={() => {
            localStorage.clear(); navigate('/login')
          }}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="ra-body">
        <SidebarDocente className="ra-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`ra-menu-item ${i === 3 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarDocente>

        <main className="ra-main">
          {mensaje && (
            <div className={`ra-alert ${tipoMensaje === 'error' ? 'ra-alert-error' : 'ra-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="ra-header">
            <div>
              <h1 className="ra-title">Asistencia y Materiales</h1>
              <p className="ra-subtitle">Gestiona la asistencia y recursos del curso</p>
            </div>
            <select className="ra-select-seccion" value={idSeccionSel}
              onChange={e => setIdSeccionSel(e.target.value)}>
              {secciones.map(s => (
                <option key={s.idSeccion} value={s.idSeccion}>
                  {s.codigo} — {s.curso}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="ra-tabs">
            <button className={`ra-tab ${tab === 'asistencia' ? 'active' : ''}`}
              onClick={() => setTab('asistencia')}>
              Registro de asistencia
            </button>
            <button className={`ra-tab ${tab === 'materiales' ? 'active' : ''}`}
              onClick={() => setTab('materiales')}>
              Materiales del curso
              <span className="ra-tab-count">{materiales.length}</span>
            </button>
          </div>

          {/* TAB ASISTENCIA */}
          {tab === 'asistencia' && (
            <div className="ra-content">
              <div className="ra-controls">
                <div className="ra-field">
                  <label>FECHA</label>
                  <input type="date" value={fecha}
                    onChange={e => setFecha(e.target.value)} />
                </div>
                <div className="ra-field">
                  <label>MODALIDAD</label>
                  <select value={modalidad}
                    onChange={e => setModalidad(e.target.value)}>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                  </select>
                </div>
              </div>

              <div className="ra-table-wrap">
                <table className="ra-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Estudiante</th>
                      {ESTADOS.map(e => (
                        <th key={e} className="ra-th-estado">{e}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r, i) => (
                      <tr key={r.idEstudiante}>
                        <td>{i + 1}</td>
                        <td><strong>{r.nombreEstudiante}</strong></td>
                        {ESTADOS.map(estado => (
                          <td key={estado} className="ra-td-radio">
                            <input
                              type="radio"
                              name={`estado-${r.idEstudiante}`}
                              checked={r.estado === estado}
                              onChange={() => handleEstado(r.idEstudiante, estado)}
                              className={colorEstado(estado)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen */}
              <div className="ra-resumen">
                {ESTADOS.map(e => (
                  <div key={e} className={`ra-resumen-item ${colorEstado(e)}`}>
                    <span className="ra-resumen-num">
                      {registros.filter(r => r.estado === e).length}
                    </span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>

              <button className="ra-btn-guardar" onClick={handleGuardarAsistencia}
                disabled={cargando || registros.length === 0}>
                {cargando ? 'Guardando...' : 'Guardar asistencia'}
              </button>
            </div>
          )}

          {/* TAB MATERIALES */}
          {tab === 'materiales' && (
            <div className="ra-content">
              <div className="ra-mat-header">
                <h3>Recursos publicados</h3>
                <button className="ra-btn-primary"
                  onClick={() => setMostrarFormMaterial(true)}>
                  + Publicar material
                </button>
              </div>

              {materiales.length === 0 ? (
                <div className="ra-empty">No hay materiales publicados para esta sección</div>
              ) : (
                <div className="ra-materiales-grid">
                  {materiales.map(m => (
                    <div key={m.idMaterial} className="ra-material-card">
                      <div className="ra-mat-icon">{iconoTipo(m.tipo)}</div>
                      <div className="ra-mat-info">
                        <h4>{m.titulo}</h4>
                        <span className="ra-mat-tipo">{m.tipo}</span>
                        <span className="ra-mat-fecha">{m.fechaPublicacion}</span>
                      </div>
                      <div className="ra-mat-actions">
                        {m.url && (
                          <a href={m.url} target="_blank" rel="noreferrer"
                            className="ra-btn-ver">Ver</a>
                        )}
                        <button className="ra-btn-delete"
                          onClick={() => handleEliminarMaterial(m.idMaterial)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL MATERIAL */}
      {mostrarFormMaterial && (
        <div className="ra-modal-overlay" onClick={() => setMostrarFormMaterial(false)}>
          <div className="ra-modal" onClick={e => e.stopPropagation()}>
            <h2>Publicar material</h2>
            <form onSubmit={handlePublicarMaterial} className="ra-form">
              <div className="ra-field">
                <label>TÍTULO</label>
                <input value={formMaterial.titulo}
                  onChange={e => setFormMaterial({...formMaterial, titulo: e.target.value})}
                  placeholder="Ej: Introducción al tema" required />
              </div>
              <div className="ra-field">
                <label>TIPO</label>
                <select value={formMaterial.tipo}
                  onChange={e => setFormMaterial({...formMaterial, tipo: e.target.value})}>
                  <option value="DOCUMENTO">Documento</option>
                  <option value="VIDEO">Video</option>
                  <option value="ENLACE">Enlace</option>
                  <option value="PRESENTACION">Presentación</option>
                </select>
              </div>
              <div className="ra-field">
                <label>URL</label>
                <input value={formMaterial.url}
                  onChange={e => setFormMaterial({...formMaterial, url: e.target.value})}
                  placeholder="https://..." />
              </div>
              <div className="ra-form-actions">
                <button type="submit" className="ra-btn-primary">Publicar</button>
                <button type="button" className="ra-btn-secondary"
                  onClick={() => setMostrarFormMaterial(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistroAsistencia