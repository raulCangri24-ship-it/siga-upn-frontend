import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerAccesosEstudiante, reintentarAccesos } from '../services/accesoServicioService'
import './MisAccesos.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarEstudiante from '../components/SidebarEstudiante'

const SERVICIO_INFO = {
  AULA_VIRTUAL:      { nombre: 'Aula Virtual',       desc: 'Acceso a materiales, tareas y contenido del curso' },
  BIBLIOTECA:        { nombre: 'Biblioteca Digital',  desc: 'Recursos bibliográficos, bases de datos y revistas' },
  VIDEOCONFERENCIA:  { nombre: 'Videoconferencias',   desc: 'Clases en línea y sesiones sincrónicas con docentes' },
}

function MisAccesos() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [accesos, setAccesos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')

  useEffect(() => { cargar() }, [idEstudiante])

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await obtenerAccesosEstudiante(idEstudiante)
      setAccesos(res.data || [])
    } catch {
      setAccesos([])
    } finally {
      setCargando(false)
    }
  }

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleReintentar = async () => {
    try {
      const res = await reintentarAccesos()
      mostrarMsg(res.data.mensaje)
      cargar()
    } catch {
      mostrarMsg('Error al reintentar activación', 'error')
    }
  }

  const menuItems = [
    { label: 'Inicio',       ruta: '/dashboard/estudiante' },
    { label: 'Mi Matrícula', ruta: '/estudiante/matricula' },
    { label: 'Mis Notas',    ruta: '/estudiante/notas' },
    { label: 'Horarios',     ruta: null },
    { label: 'Mis Pagos',    ruta: '/estudiante/pagos' },
    { label: 'Mis Accesos',  ruta: '/estudiante/accesos' },
  ]

  const colorEstado = (estado) => {
    if (estado === 'ACTIVO')     return 'ma-badge-activo'
    if (estado === 'SUSPENDIDO') return 'ma-badge-suspendido'
    return 'ma-badge-pendiente'
  }

  const hayPendientes = accesos.some(a => a.estado === 'PENDIENTE')

  return (
    <div className="ma-container">

      {/* NAVBAR */}
      <nav className="ma-navbar">
        <div className="ma-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="ma-logo-text">SIGA</span>
          <span className="ma-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="ma-navbar-right">
          <span className="ma-user">👤 {nombre}</span>
          <button className="ma-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="ma-body">

        {/* SIDEBAR */}
        <SidebarEstudiante className="ma-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`ma-menu-item ${i === 5 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarEstudiante>

        {/* MAIN */}
        <main className="ma-main">

          {mensaje && (
            <div className={`ma-alert ${tipoMensaje === 'error' ? 'ma-alert-error' : 'ma-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="ma-header">
            <div>
              <h1 className="ma-title">Mis Accesos a Servicios</h1>
              <p className="ma-subtitle">Estado de tus accesos a plataformas académicas digitales</p>
            </div>
            {hayPendientes && (
              <button className="ma-btn-reintentar" onClick={handleReintentar}>
                Reintentar activación
              </button>
            )}
          </div>

          {cargando && (
            <div className="ma-cargando">
              <div className="ma-spinner" />
              <p>Cargando accesos...</p>
            </div>
          )}

          {!cargando && accesos.length === 0 && (
            <div className="ma-empty">
              <p>No tienes accesos registrados.</p>
              <p className="ma-empty-sub">Los accesos se crean automáticamente al confirmar una matrícula.</p>
            </div>
          )}

          {!cargando && accesos.length > 0 && (
            <div className="ma-servicios-grid">
              {['AULA_VIRTUAL', 'BIBLIOTECA', 'VIDEOCONFERENCIA'].map(servicio => {
                const acceso = accesos.find(a => a.servicio === servicio)
                const info = SERVICIO_INFO[servicio]

                return (
                  <div key={servicio} className={`ma-servicio-card ${acceso ? acceso.estado.toLowerCase() : 'sin-acceso'}`}>
                    <div className="ma-servicio-icon">
                      {servicio === 'AULA_VIRTUAL'     && <div className="ma-icon ma-icon-aula" />}
                      {servicio === 'BIBLIOTECA'        && <div className="ma-icon ma-icon-biblio" />}
                      {servicio === 'VIDEOCONFERENCIA'  && <div className="ma-icon ma-icon-video" />}
                    </div>

                    <div className="ma-servicio-info">
                      <h3 className="ma-servicio-nombre">{info.nombre}</h3>
                      <p className="ma-servicio-desc">{info.desc}</p>
                    </div>

                    {acceso ? (
                      <div className="ma-servicio-estado">
                        <span className={`ma-badge ${colorEstado(acceso.estado)}`}>
                          {acceso.estado}
                        </span>
                        {acceso.estado === 'ACTIVO' && acceso.fechaActivacion && (
                          <p className="ma-fecha">Activo desde {acceso.fechaActivacion}</p>
                        )}
                        {acceso.estado === 'SUSPENDIDO' && (
                          <p className="ma-fecha ma-fecha-warn">Acceso suspendido por restricción financiera</p>
                        )}
                        {acceso.estado === 'PENDIENTE' && (
                          <p className="ma-fecha">Activación en proceso · Intento {acceso.intentos}/3</p>
                        )}
                      </div>
                    ) : (
                      <div className="ma-servicio-estado">
                        <span className="ma-badge ma-badge-sin">SIN ACCESO</span>
                        <p className="ma-fecha">Matrícula requerida</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!cargando && accesos.some(a => a.estado === 'SUSPENDIDO') && (
            <div className="ma-aviso-suspendido">
              <strong>Accesos suspendidos:</strong> Tienes una restricción financiera activa.
              Regulariza tu situación en Tesorería para rehabilitar el acceso a los servicios digitales.
              <br /><strong>tesoreria@upn.edu.pe</strong> · Interno <strong>1234</strong>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default MisAccesos
