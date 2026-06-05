import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardEstudiantil } from '../services/dashboardService'
import SidebarAdmin from '../components/SidebarAdmin'
import './DashboardEstudiantil.css'
import logoUpn from '../assets/logo-upn.png.png'

function DashboardEstudiantil() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getDashboardEstudiantil()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }, [])

  const maxEstado = data
    ? Math.max(...Object.values(data.estudiantesPorEstado), 1)
    : 1
  const maxMat = data
    ? Math.max(...Object.values(data.matriculasPorEstado), 1)
    : 1

  const colorBarra = {
    ACTIVO: '#16a34a', INACTIVO: '#d97706', BLOQUEADO: '#dc2626',
    CONFIRMADA: '#1A3F7A', CANCELADA: '#dc2626', PENDIENTE: '#d97706',
  }

  return (
    <div className="de-container">

      <nav className="de-navbar">
        <div className="de-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="de-logo-text">SIGA</span>
          <span className="de-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="de-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
          Cerrar sesión
        </button>
      </nav>

      <div className="de-body">
        <SidebarAdmin />

        <main className="de-main">
          <div className="de-header">
            <h1 className="de-title">Dashboard Estudiantil</h1>
            <p className="de-subtitle">Indicadores clave sobre el desempeño y estado del alumnado</p>
          </div>

          {cargando && <div className="de-cargando">Cargando indicadores...</div>}

          {!cargando && !data && (
            <div className="de-error">No se pudo cargar la información del dashboard.</div>
          )}

          {!cargando && data && <>

            {/* KPI Cards */}
            <div className="de-kpi-grid">
              <div className="de-kpi-card">
                <div className="de-kpi-accent" style={{ background: '#1A3F7A' }} />
                <div className="de-kpi-valor">{data.totalEstudiantes}</div>
                <div className="de-kpi-label">Total estudiantes</div>
                <div className="de-kpi-sub">{data.estudiantesActivos} activos</div>
              </div>
              <div className="de-kpi-card">
                <div className="de-kpi-accent" style={{ background: '#16a34a' }} />
                <div className="de-kpi-valor">{data.totalMatriculas}</div>
                <div className="de-kpi-label">Matrículas confirmadas</div>
                <div className="de-kpi-sub">{data.estudiantesConDeudaVencida} con deuda vencida</div>
              </div>
              <div className="de-kpi-card">
                <div className="de-kpi-accent" style={{ background: data.tasaDesercion > 10 ? '#dc2626' : '#d97706' }} />
                <div className="de-kpi-valor">{data.tasaDesercion}%</div>
                <div className="de-kpi-label">Tasa de deserción</div>
                <div className="de-kpi-sub">Matrículas canceladas</div>
              </div>
              <div className="de-kpi-card">
                <div className="de-kpi-accent" style={{ background: '#FFC300' }} />
                <div className="de-kpi-valor" style={{ color: '#0A1628' }}>{data.promedioGeneral}</div>
                <div className="de-kpi-label">Promedio general</div>
                <div className="de-kpi-sub">Sobre 20 puntos</div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="de-charts-grid">

              {/* Estudiantes por estado */}
              <div className="de-chart-card">
                <h3 className="de-chart-title">Estudiantes por estado</h3>
                <div className="de-chart-body">
                  {Object.entries(data.estudiantesPorEstado).map(([estado, val]) => (
                    <div key={estado} className="de-bar-row">
                      <div className="de-bar-label">{estado}</div>
                      <div className="de-bar-track">
                        <div
                          className="de-bar-fill"
                          style={{
                            width: `${(val / maxEstado) * 100}%`,
                            background: colorBarra[estado] || '#1A3F7A'
                          }}>
                          <span className="de-bar-num">{val}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matrículas por estado */}
              <div className="de-chart-card">
                <h3 className="de-chart-title">Matrículas por estado</h3>
                <div className="de-chart-body">
                  {Object.entries(data.matriculasPorEstado).map(([estado, val]) => (
                    <div key={estado} className="de-bar-row">
                      <div className="de-bar-label">{estado}</div>
                      <div className="de-bar-track">
                        <div
                          className="de-bar-fill"
                          style={{
                            width: `${(val / maxMat) * 100}%`,
                            background: colorBarra[estado] || '#1A3F7A'
                          }}>
                          <span className="de-bar-num">{val}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Top 5 rendimiento */}
            <div className="de-table-card">
              <h3 className="de-chart-title">Top 5 — Estudiantes con mejor rendimiento</h3>
              {data.top5EstudiantesRendimiento.length === 0 ? (
                <p className="de-empty">No hay notas registradas aún.</p>
              ) : (
                <table className="de-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top5EstudiantesRendimiento.map((est, i) => (
                      <tr key={est.idEstudiante}>
                        <td>
                          <span className={`de-rank de-rank-${i + 1}`}>{i + 1}</span>
                        </td>
                        <td>{est.idEstudiante}</td>
                        <td><strong>{est.nombre}</strong></td>
                        <td>
                          <span className={`de-prom ${est.promedio >= 11 ? 'aprobado' : 'desaprobado'}`}>
                            {est.promedio}
                          </span>
                        </td>
                      </tr>
                    ))}
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

export default DashboardEstudiantil
