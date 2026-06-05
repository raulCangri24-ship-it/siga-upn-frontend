import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardRector } from '../services/dashboardService'
import SidebarAdmin from '../components/SidebarAdmin'
import './DashboardRector.css'
import logoUpn from '../assets/logo-upn.png.png'

function DashboardRector() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getDashboardRector()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }, [])

  const totalFinanciero = data
    ? (data.resumenFinanciero.totalCobrado + data.resumenFinanciero.totalPendiente + data.resumenFinanciero.totalVencido)
    : 1

  const pct = (val) => totalFinanciero > 0
    ? Math.min(Math.round((val / totalFinanciero) * 100), 100)
    : 0

  return (
    <div className="dr-container">

      <nav className="dr-navbar">
        <div className="dr-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="dr-logo-text">SIGA</span>
          <span className="dr-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="dr-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
          Cerrar sesión
        </button>
      </nav>

      <div className="dr-body">
        <SidebarAdmin />

        <main className="dr-main">
          <div className="dr-header">
            <h1 className="dr-title">Dashboard Estratégico</h1>
            <p className="dr-subtitle">Vista ejecutiva del estado financiero y académico institucional</p>
          </div>

          {cargando && <div className="dr-cargando">Cargando indicadores estratégicos...</div>}
          {!cargando && !data && <div className="dr-error">No se pudo cargar la información.</div>}

          {!cargando && data && <>

            {/* KPI Cards grandes */}
            <div className="dr-kpi-grid">
              <div className="dr-kpi-card verde">
                <div className="dr-kpi-emoji">💰</div>
                <div className="dr-kpi-valor">S/ {data.totalIngresos.toFixed(2)}</div>
                <div className="dr-kpi-label">Total ingresos cobrados</div>
                <div className="dr-kpi-sub">Pagos confirmados en el sistema</div>
              </div>
              <div className={`dr-kpi-card ${data.deudasVencidas > 0 ? 'rojo' : ''}`}>
                <div className="dr-kpi-emoji">⚠️</div>
                <div className="dr-kpi-valor">{data.deudasVencidas}</div>
                <div className="dr-kpi-label">Deudas vencidas</div>
                <div className="dr-kpi-sub">S/ {data.montoDeudaTotal.toFixed(2)} en mora</div>
              </div>
              <div className={`dr-kpi-card ${data.restriccionesActivas > 0 ? 'ambar' : ''}`}>
                <div className="dr-kpi-emoji">🔒</div>
                <div className="dr-kpi-valor">{data.restriccionesActivas}</div>
                <div className="dr-kpi-label">Restricciones activas</div>
                <div className="dr-kpi-sub">{data.estudiantesConAccesoActivo} con acceso digital activo</div>
              </div>
              <div className="dr-kpi-card azul">
                <div className="dr-kpi-emoji">📊</div>
                <div className="dr-kpi-valor">{data.ocupacionPromedio}%</div>
                <div className="dr-kpi-label">Ocupación promedio aulas</div>
                <div className="dr-kpi-sub">Ratio matrículas / capacidad</div>
              </div>
            </div>

            {/* Resumen financiero */}
            <div className="dr-finance-card">
              <h3 className="dr-section-title">📈 Resumen financiero</h3>
              <div className="dr-finance-grid">

                <div className="dr-finance-item">
                  <div className="dr-finance-header">
                    <span className="dr-finance-label">Total cobrado</span>
                    <span className="dr-finance-val verde">S/ {data.resumenFinanciero.totalCobrado.toFixed(2)}</span>
                  </div>
                  <div className="dr-progress-track">
                    <div className="dr-progress-fill verde" style={{ width: `${pct(data.resumenFinanciero.totalCobrado)}%` }} />
                  </div>
                  <div className="dr-progress-pct">{pct(data.resumenFinanciero.totalCobrado)}% del total financiero</div>
                </div>

                <div className="dr-finance-item">
                  <div className="dr-finance-header">
                    <span className="dr-finance-label">Total pendiente</span>
                    <span className="dr-finance-val ambar">S/ {data.resumenFinanciero.totalPendiente.toFixed(2)}</span>
                  </div>
                  <div className="dr-progress-track">
                    <div className="dr-progress-fill ambar" style={{ width: `${pct(data.resumenFinanciero.totalPendiente)}%` }} />
                  </div>
                  <div className="dr-progress-pct">{pct(data.resumenFinanciero.totalPendiente)}% del total financiero</div>
                </div>

                <div className="dr-finance-item">
                  <div className="dr-finance-header">
                    <span className="dr-finance-label">Total vencido (mora)</span>
                    <span className="dr-finance-val rojo">S/ {data.resumenFinanciero.totalVencido.toFixed(2)}</span>
                  </div>
                  <div className="dr-progress-track">
                    <div className="dr-progress-fill rojo" style={{ width: `${pct(data.resumenFinanciero.totalVencido)}%` }} />
                  </div>
                  <div className="dr-progress-pct">{pct(data.resumenFinanciero.totalVencido)}% del total financiero</div>
                </div>

              </div>
            </div>

            {/* Tarjetas de resumen institucional */}
            <div className="dr-resumen-grid">
              <div className="dr-resumen-card">
                <div className="dr-resumen-emoji">🎓</div>
                <div className="dr-resumen-info">
                  <div className="dr-resumen-titulo">Acceso digital activo</div>
                  <div className="dr-resumen-valor">{data.estudiantesConAccesoActivo} estudiantes</div>
                  <div className="dr-resumen-desc">Con al menos un servicio ACTIVO</div>
                </div>
              </div>
              <div className="dr-resumen-card">
                <div className="dr-resumen-emoji">📚</div>
                <div className="dr-resumen-info">
                  <div className="dr-resumen-titulo">Ocupación institucional</div>
                  <div className="dr-resumen-valor">{data.ocupacionPromedio}%</div>
                  <div className="dr-resumen-desc">Promedio de uso de aulas y secciones</div>
                </div>
              </div>
              <div className="dr-resumen-card">
                <div className="dr-resumen-emoji">🚫</div>
                <div className="dr-resumen-info">
                  <div className="dr-resumen-titulo">Restricciones vigentes</div>
                  <div className="dr-resumen-valor">{data.restriccionesActivas}</div>
                  <div className="dr-resumen-desc">Estudiantes con bloqueo activo</div>
                </div>
              </div>
            </div>

          </>}
        </main>
      </div>
    </div>
  )
}

export default DashboardRector
