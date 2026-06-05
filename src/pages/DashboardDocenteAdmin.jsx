import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardDocente } from '../services/dashboardService'
import SidebarAdmin from '../components/SidebarAdmin'
import './DashboardDocenteAdmin.css'
import logoUpn from '../assets/logo-upn.png.png'

function DashboardDocenteAdmin() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getDashboardDocente()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }, [])

  const maxSec = data && data.seccionesPorDocente.length > 0
    ? Math.max(...data.seccionesPorDocente.map(d => d.totalSecciones), 1)
    : 1

  return (
    <div className="da-container">

      <nav className="da-navbar">
        <div className="da-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="da-logo-text">SIGA</span>
          <span className="da-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="da-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
          Cerrar sesión
        </button>
      </nav>

      <div className="da-body">
        <SidebarAdmin />

        <main className="da-main">
          <div className="da-header">
            <h1 className="da-title">Dashboard Docente</h1>
            <p className="da-subtitle">Indicadores de actividad docente, secciones y cumplimiento académico</p>
          </div>

          {cargando && <div className="da-cargando">Cargando indicadores...</div>}
          {!cargando && !data && <div className="da-error">No se pudo cargar la información.</div>}

          {!cargando && data && <>

            {/* KPI Cards */}
            <div className="da-kpi-grid">
              <div className="da-kpi-card">
                <div className="da-kpi-accent" style={{ background: '#1A3F7A' }} />
                <div className="da-kpi-valor">{data.totalDocentes}</div>
                <div className="da-kpi-label">Total docentes</div>
                <div className="da-kpi-sub">{data.docentesActivos} activos</div>
              </div>
              <div className="da-kpi-card">
                <div className="da-kpi-accent" style={{ background: '#0D2B55' }} />
                <div className="da-kpi-valor">{data.totalSecciones}</div>
                <div className="da-kpi-label">Secciones activas</div>
                <div className="da-kpi-sub">Periodo 2026-1</div>
              </div>
              <div className="da-kpi-card">
                <div className="da-kpi-accent" style={{ background: '#16a34a' }} />
                <div className="da-kpi-valor">{data.actasFirmadas}</div>
                <div className="da-kpi-label">Actas firmadas</div>
                <div className="da-kpi-sub">{data.actasBorrador} en borrador</div>
              </div>
              <div className="da-kpi-card">
                <div className="da-kpi-accent" style={{ background: '#FFC300' }} />
                <div className="da-kpi-valor" style={{ color: '#0A1628' }}>{data.cumplimientoActas}%</div>
                <div className="da-kpi-label">Cumplimiento actas</div>
                <div className="da-kpi-sub">Asistencia: {data.promedioAsistencia}%</div>
              </div>
            </div>

            <div className="da-charts-grid">

              {/* Secciones por docente - barras */}
              <div className="da-chart-card">
                <h3 className="da-chart-title">Secciones por docente</h3>
                {data.seccionesPorDocente.length === 0 ? (
                  <p className="da-empty">No hay secciones registradas.</p>
                ) : (
                  <div className="da-chart-body">
                    {data.seccionesPorDocente.map((d, i) => (
                      <div key={i} className="da-bar-row">
                        <div className="da-bar-label" title={d.nombreDocente}>
                          {d.nombreDocente.split(' ')[0]}
                        </div>
                        <div className="da-bar-track">
                          <div
                            className="da-bar-fill"
                            style={{ width: `${(d.totalSecciones / maxSec) * 100}%` }}>
                            <span className="da-bar-num">{d.totalSecciones}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cumplimiento panel */}
              <div className="da-chart-card">
                <h3 className="da-chart-title">Indicadores generales</h3>
                <div className="da-indicadores">
                  <div className="da-indic-row">
                    <div className="da-indic-label">Cumplimiento de actas</div>
                    <div className="da-indic-bar-track">
                      <div className="da-indic-bar-fill verde"
                        style={{ width: `${Math.min(data.cumplimientoActas, 100)}%` }} />
                    </div>
                    <div className="da-indic-pct">{data.cumplimientoActas}%</div>
                  </div>
                  <div className="da-indic-row">
                    <div className="da-indic-label">Promedio asistencia</div>
                    <div className="da-indic-bar-track">
                      <div className="da-indic-bar-fill azul"
                        style={{ width: `${Math.min(data.promedioAsistencia, 100)}%` }} />
                    </div>
                    <div className="da-indic-pct">{data.promedioAsistencia}%</div>
                  </div>
                  <div className="da-indic-row">
                    <div className="da-indic-label">Docentes activos</div>
                    <div className="da-indic-bar-track">
                      <div className="da-indic-bar-fill dorado"
                        style={{ width: `${data.totalDocentes > 0 ? (data.docentesActivos / data.totalDocentes) * 100 : 0}%` }} />
                    </div>
                    <div className="da-indic-pct">
                      {data.totalDocentes > 0
                        ? Math.round((data.docentesActivos / data.totalDocentes) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Tabla de docentes */}
            <div className="da-table-card">
              <h3 className="da-chart-title">Detalle por docente</h3>
              {data.seccionesPorDocente.length === 0 ? (
                <p className="da-empty">No hay datos disponibles.</p>
              ) : (
                <table className="da-table">
                  <thead>
                    <tr>
                      <th>Docente</th>
                      <th>Secciones</th>
                      <th>Actas firmadas</th>
                      <th>% Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.seccionesPorDocente.map((d, i) => {
                      const pct = d.totalSecciones > 0
                        ? Math.round((d.actasFirmadas / d.totalSecciones) * 100)
                        : 0
                      return (
                        <tr key={i}>
                          <td><strong>{d.nombreDocente}</strong></td>
                          <td>{d.totalSecciones}</td>
                          <td>{d.actasFirmadas}</td>
                          <td>
                            <span className={`da-pct-badge ${pct >= 80 ? 'verde' : pct >= 50 ? 'ambar' : 'rojo'}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </>}
        </main>
      </div>
    </div>
  )
}

export default DashboardDocenteAdmin
