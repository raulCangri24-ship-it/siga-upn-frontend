import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, TrendingDown, Star } from 'lucide-react'
import { getDashboardEstudiantil } from '../services/dashboardService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const cardVar = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) }

const COLOR_ESTADO = {
  ACTIVO: 'var(--success-text)', INACTIVO: 'var(--warning-text)', BLOQUEADO: 'var(--danger-text)',
  CONFIRMADA: 'var(--accent-blue)', CANCELADA: 'var(--danger-text)', PENDIENTE: 'var(--warning-text)',
}

function BarChart({ data, colorMap, max }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Object.entries(data).map(([key, val]) => {
        const pct = max > 0 ? (val / max) * 100 : 0
        const color = colorMap[key] || 'var(--accent-blue)'
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{key}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color }}>{val}</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                style={{ height: '100%', background: color, borderRadius: '4px' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DashboardEstudiantil() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getDashboardEstudiantil().then(r => setData(r.data)).catch(() => setData(null)).finally(() => setCargando(false))
  }, [])

  const maxEstado = data ? Math.max(...Object.values(data.estudiantesPorEstado), 1) : 1
  const maxMat = data ? Math.max(...Object.values(data.matriculasPorEstado), 1) : 1

  const kpis = data ? [
    { Icon: Users, label: 'Total estudiantes', val: data.totalEstudiantes, sub: `${data.estudiantesActivos} activos`, color: 'var(--info-text)', bg: 'var(--info-bg)' },
    { Icon: BookOpen, label: 'Matrículas confirmadas', val: data.totalMatriculas, sub: `${data.estudiantesConDeudaVencida} con deuda vencida`, color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { Icon: TrendingDown, label: 'Tasa de deserción', val: `${data.tasaDesercion}%`, sub: 'Matrículas canceladas', color: data.tasaDesercion > 10 ? 'var(--danger-text)' : 'var(--warning-text)', bg: data.tasaDesercion > 10 ? 'var(--danger-bg)' : 'var(--warning-bg)' },
    { Icon: Star, label: 'Promedio general', val: data.promedioGeneral, sub: 'Sobre 20 puntos', color: 'var(--accent)', bg: 'var(--warning-bg)' },
  ] : []

  const rankColors = ['#F5AD27', '#C0C0C0', '#CD7F32']

  return (
    <PageShell role="admin" navTitle="Dashboard Estudiantil">
      <PageHeader title="Dashboard Estudiantil" subtitle="Indicadores clave sobre el desempeño y estado del alumnado" />

      {cargando && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Cargando indicadores...
        </div>
      )}
      {!cargando && !data && (
        <div style={{ padding: '32px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', textAlign: 'center', fontSize: '14px' }}>
          No se pudo cargar la información del dashboard.
        </div>
      )}

      {!cargando && data && <>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {kpis.map((k, i) => (
            <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: k.color, borderRadius: '14px 0 0 14px' }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <k.Icon size={18} color={k.color} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', margin: '6px 0 3px' }}>{k.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Estudiantes por estado</h3>
            <BarChart data={data.estudiantesPorEstado} colorMap={COLOR_ESTADO} max={maxEstado} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Matrículas por estado</h3>
            <BarChart data={data.matriculasPorEstado} colorMap={COLOR_ESTADO} max={maxMat} />
          </motion.div>
        </div>

        {/* Top 5 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Top 5 — Estudiantes con mejor rendimiento</h3>
          {data.top5EstudiantesRendimiento.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No hay notas registradas aún.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'ID', 'Nombre', 'Promedio'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.top5EstudiantesRendimiento.map((est, i) => (
                  <tr key={est.idEstudiante} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: rankColors[i] || 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: i < 3 ? '#000' : 'var(--text-primary)' }}>{i + 1}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{est.idEstudiante}</td>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{est.nombre}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', background: est.promedio >= 11 ? 'var(--success-bg)' : 'var(--danger-bg)', color: est.promedio >= 11 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        {est.promedio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </>}
    </PageShell>
  )
}

export default DashboardEstudiantil
