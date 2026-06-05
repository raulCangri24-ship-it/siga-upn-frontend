import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { verificarRestriccion } from '../services/deudaService'
import './RestriccionDeuda.css'
import logoUpn from '../assets/logo-upn.png.png'

function RestriccionDeuda() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [deuda, setDeuda] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await verificarRestriccion(idEstudiante)
        if (res.data) {
          setDeuda(res.data)
        } else {
          // Sin restricción activa — redirigir al portal
          navigate('/estudiante/matricula')
        }
      } catch {
        // 204 No Content llega como respuesta vacía, no como error
        navigate('/estudiante/matricula')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [idEstudiante, navigate])

  const formatMonto = (monto) => {
    const num = parseFloat(monto)
    return isNaN(num) ? monto : `S/ ${num.toFixed(2)}`
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
  }

  const menuItems = [
    { label: 'Inicio', ruta: '/dashboard/estudiante' },
    { label: 'Mi Matrícula', ruta: '/estudiante/matricula' },
    { label: 'Mis Notas', ruta: null },
    { label: 'Horarios', ruta: null },
    { label: 'Mis Pagos', ruta: null },
  ]

  if (cargando) {
    return (
      <div className="rd-loading">
        <div className="rd-spinner" />
        <p>Verificando estado de cuenta...</p>
      </div>
    )
  }

  return (
    <div className="rd-container">

      {/* NAVBAR */}
      <nav className="rd-navbar">
        <div className="rd-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="rd-logo-text">SIGA</span>
          <span className="rd-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="rd-navbar-right">
          <span className="rd-user">👤 {nombre}</span>
          <button className="rd-logout" onClick={() => {
            localStorage.clear()
            navigate('/login')
          }}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="rd-body">

        {/* SIDEBAR */}
        <aside className="rd-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`rd-menu-item ${i === 1 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </aside>

        {/* MAIN */}
        <main className="rd-main">

          <div className="rd-bloqueo-wrapper">

            {/* Ícono de bloqueo */}
            <div className="rd-icono-bloqueo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" fill="#dc2626"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="white"/>
              </svg>
            </div>

            <h1 className="rd-titulo">Acceso Restringido</h1>
            <p className="rd-subtitulo">
              Tu matrícula ha sido bloqueada por una deuda pendiente con la institución.
            </p>

            {deuda && (
              <div className="rd-deuda-card">
                <div className="rd-deuda-header">
                  <span className="rd-deuda-badge">DEUDA VENCIDA</span>
                  <span className="rd-deuda-id">Ref: {deuda.idDeuda}</span>
                </div>

                <div className="rd-deuda-monto">
                  {formatMonto(deuda.monto)}
                </div>

                <div className="rd-deuda-concepto">{deuda.concepto}</div>

                <div className="rd-deuda-info-grid">
                  <div className="rd-info-item">
                    <span className="rd-info-label">Fecha de vencimiento</span>
                    <span className="rd-info-valor rd-vencida">{formatFecha(deuda.fechaVencimiento)}</span>
                  </div>
                  <div className="rd-info-item">
                    <span className="rd-info-label">Estado</span>
                    <span className="rd-info-valor rd-estado-badge">{deuda.estado}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rd-instrucciones">
              <h3>¿Cómo levantar la restricción?</h3>
              <ol>
                <li>Acércate a <strong>Caja de Tesorería</strong> (Pabellón A, 1er piso) con tu DNI.</li>
                <li>Realiza el pago de la deuda indicada o suscríbete a un <strong>plan de pagos</strong>.</li>
                <li>Una vez registrado el pago por administración, el acceso se restablecerá automáticamente.</li>
              </ol>
            </div>

            <div className="rd-acciones">
              <button className="rd-btn-dashboard" onClick={() => navigate('/dashboard/estudiante')}>
                Volver al Inicio
              </button>
              <button className="rd-btn-refresh" onClick={() => window.location.reload()}>
                Actualizar estado
              </button>
            </div>

            <p className="rd-contacto">
              Consultas: <strong>tesoreria@upn.edu.pe</strong> · Interno <strong>1234</strong>
            </p>

          </div>
        </main>
      </div>
    </div>
  )
}

export default RestriccionDeuda
