import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarDeudasEstudiante } from '../services/deudaService'
import { listarPagosPorEstudiante } from '../services/pagoService'
import './MisPagos.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarEstudiante from '../components/SidebarEstudiante'

function MisPagos() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [deudas, setDeudas] = useState([])
  const [pagos, setPagos] = useState([])
  const [tab, setTab] = useState('deudas')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dRes, pRes] = await Promise.all([
          listarDeudasEstudiante(idEstudiante),
          listarPagosPorEstudiante(idEstudiante)
        ])
        setDeudas(dRes.data || [])
        setPagos(pRes.data || [])
      } catch {
        setDeudas([])
        setPagos([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [idEstudiante])

  const deudasActivas = deudas.filter(d => d.estado !== 'PAGADA')
  const deudasVencidas = deudas.filter(d => d.estado === 'VENCIDA')
  const totalPagado = pagos
    .filter(p => p.estado === 'CONFIRMADO')
    .reduce((acc, p) => acc + parseFloat(p.monto || 0), 0)

  const colorDeuda = (estado) => {
    if (estado === 'PAGADA') return 'mp-badge-pagada'
    if (estado === 'VENCIDA') return 'mp-badge-vencida'
    return 'mp-badge-pendiente'
  }

  const colorPago = (estado) => {
    if (estado === 'CONFIRMADO') return 'mp-badge-confirmado'
    if (estado === 'ANULADO') return 'mp-badge-anulado'
    return 'mp-badge-procesando'
  }

  const formatFecha = (f) => {
    if (!f) return '—'
    if (f.includes('/')) return f
    const [y, m, d] = f.split('-')
    return `${d}/${m}/${y}`
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
    <div className="mp-container">

      {/* NAVBAR */}
      <nav className="mp-navbar">
        <div className="mp-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="mp-logo-text">SIGA</span>
          <span className="mp-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="mp-navbar-right">
          <span className="mp-user">👤 {nombre}</span>
          <button className="mp-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="mp-body">

        {/* SIDEBAR */}
        <SidebarEstudiante className="mp-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`mp-menu-item ${i === 4 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarEstudiante>

        {/* MAIN */}
        <main className="mp-main">

          <div className="mp-header">
            <h1 className="mp-title">Mis Pagos</h1>
            <p className="mp-subtitle">Resumen de tu situación financiera con la institución</p>
          </div>

          {/* Tarjetas resumen */}
          {!cargando && (
            <div className="mp-stats-grid">
              <div className="mp-stat-card">
                <div className="mp-stat-valor">{deudasActivas.length}</div>
                <div className="mp-stat-label">Deudas activas</div>
              </div>
              <div className={`mp-stat-card ${deudasVencidas.length > 0 ? 'alerta' : ''}`}>
                <div className="mp-stat-valor">{deudasVencidas.length}</div>
                <div className="mp-stat-label">Deudas vencidas</div>
              </div>
              <div className="mp-stat-card verde">
                <div className="mp-stat-valor">S/ {totalPagado.toFixed(2)}</div>
                <div className="mp-stat-label">Total pagado</div>
              </div>
              <div className="mp-stat-card">
                <div className="mp-stat-valor">{pagos.filter(p => p.estado === 'CONFIRMADO').length}</div>
                <div className="mp-stat-label">Pagos confirmados</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mp-tabs">
            <button
              className={`mp-tab ${tab === 'deudas' ? 'active' : ''}`}
              onClick={() => setTab('deudas')}>
              Mis Deudas
              <span className="mp-tab-count">{deudas.length}</span>
            </button>
            <button
              className={`mp-tab ${tab === 'historial' ? 'active' : ''}`}
              onClick={() => setTab('historial')}>
              Historial de Pagos
              <span className="mp-tab-count">{pagos.length}</span>
            </button>
          </div>

          {cargando && <div className="mp-empty">Cargando información financiera...</div>}

          {/* Tab: Deudas */}
          {!cargando && tab === 'deudas' && (
            deudas.length === 0
              ? <div className="mp-empty">No tienes deudas registradas.</div>
              : (
                <div className="mp-table-wrap">
                  <table className="mp-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deudas.map(d => (
                        <tr key={d.idDeuda}>
                          <td>{d.idDeuda}</td>
                          <td>{d.concepto}</td>
                          <td><strong>S/ {parseFloat(d.monto).toFixed(2)}</strong></td>
                          <td>{formatFecha(d.fechaVencimiento)}</td>
                          <td><span className={`mp-badge ${colorDeuda(d.estado)}`}>{d.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}

          {/* Tab: Historial de pagos */}
          {!cargando && tab === 'historial' && (
            pagos.length === 0
              ? <div className="mp-empty">No tienes pagos registrados.</div>
              : (
                <div className="mp-table-wrap">
                  <table className="mp-table">
                    <thead>
                      <tr>
                        <th>ID Pago</th>
                        <th>Concepto pago</th>
                        <th>Deuda asociada</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map(p => (
                        <tr key={p.idPago}>
                          <td>{p.idPago}</td>
                          <td>{p.concepto}</td>
                          <td><span className="mp-deuda-ref">{p.conceptoDeuda}</span></td>
                          <td><strong>S/ {parseFloat(p.monto).toFixed(2)}</strong></td>
                          <td>{p.fecha}</td>
                          <td><span className={`mp-badge ${colorPago(p.estado)}`}>{p.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}

          {/* Aviso si tiene deudas vencidas */}
          {!cargando && deudasVencidas.length > 0 && (
            <div className="mp-aviso-vencida">
              <strong>Atención:</strong> Tienes {deudasVencidas.length} deuda(s) vencida(s).
              Acércate a Tesorería para regularizar tu situación y evitar restricciones académicas.
              <br /><strong>tesoreria@upn.edu.pe</strong> · Interno <strong>1234</strong>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default MisPagos
