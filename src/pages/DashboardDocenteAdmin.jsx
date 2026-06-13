import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Grid, FileCheck, TrendingUp } from 'lucide-react'
import { getDashboardDocente } from '../services/dashboardService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const cardVar = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) }

function DashboardDocenteAdmin() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getDashboardDocente().then(r => setData(r.data)).catch(() => setData(null)).finally(() => setCargando(false))
  }, [])

  const maxSec = data && data.seccionesPorDocente.length > 0
    ? Math.max(...data.seccionesPorDocente.map(d => d.totalSecciones), 1) : 1

  const kpis = data ? [
    { Icon: UserCheck, label: 'Total docentes', val: data.totalDocentes, sub: `${data.docentesActivos} activos`, color: 'var(--info-text)', bg: 'var(--info-bg)' },
    { Icon: Grid, label: 'Secciones activas', val: data.totalSecciones, sub: 'Periodo 2026-1', color: 'var(--accent-blue)', bg: 'var(--info-bg)' },
    { Icon: FileCheck, label: 'Actas firmadas', val: data.actasFirmadas, sub: `${data.actasBorrador} en borrador`, color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { Icon: TrendingUp, label: 'Cumplimiento actas', val: `${data.cumplimientoActas}%`, sub: `Asistencia: ${data.promedioAsistencia}%`, color: 'var(--accent)', bg: 'var(--warning-bg)' },
  ] : []

  const pctColor = (p) => p >= 80 ? 'var(--success-text)' : p >= 50 ? 'var(--warning-text)' : 'var(--danger-text)'
  const pctBg = (p) => p >= 80 ? 'var(--success-bg)' : p >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)'

  return (
    <PageShell role="admin" navTitle="Dashboard Docente">
      <PageHeader title="Dashboard Docente" subtitle="Indicadores de actividad docente, secciones y cumplimiento académico" />

      {cargando && <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Cargando indicadores...</div>}
      {!cargando && !data && <div style={{ padding: '32px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', textAlign: 'center' }}>No se pudo cargar la información.</div>}

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

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Secciones por docente */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Secciones por docente</h3>
            {data.seccionesPorDocente.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No hay secciones registradas.</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.seccionesPorDocente.map((d, i) => {
                    const pct = maxSec > 0 ? (d.totalSecciones / maxSec) * 100 : 0
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }} title={d.nombreDocente}>{d.nombreDocente.split(' ')[0]}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-blue)' }}>{d.totalSecciones}</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.05 }}
                            style={{ height: '100%', background: 'var(--accent-blue)', borderRadius: '4px' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </motion.div>

          {/* Indicadores */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Indicadores generales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: 'Cumplimiento de actas', val: data.cumplimientoActas, color: 'var(--success-text)' },
                { label: 'Promedio asistencia', val: data.promedioAsistencia, color: 'var(--info-text)' },
                { label: 'Docentes activos', val: data.totalDocentes > 0 ? Math.round((data.docentesActivos / data.totalDocentes) * 100) : 0, color: 'var(--accent)' },
              ].map(ind => (
                <div key={ind.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{ind.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: ind.color }}>{ind.val}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(ind.val, 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      style={{ height: '100%', background: ind.color, borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabla docentes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Detalle por docente</h3>
          {data.seccionesPorDocente.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No hay datos disponibles.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Docente', 'Secciones', 'Actas firmadas', '% Cumplimiento'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.seccionesPorDocente.map((d, i) => {
                    const pct = d.totalSecciones > 0 ? Math.round((d.actasFirmadas / d.totalSecciones) * 100) : 0
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{d.nombreDocente}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.totalSecciones}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.actasFirmadas}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: pctBg(pct), color: pctColor(pct) }}>{pct}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          }
        </motion.div>
      </>}
    </PageShell>
  )
}

export default DashboardDocenteAdmin
