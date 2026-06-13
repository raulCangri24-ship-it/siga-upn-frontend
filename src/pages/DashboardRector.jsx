import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, AlertTriangle, Lock, BarChart2, GraduationCap, BookOpen, XCircle } from 'lucide-react'
import { getDashboardRector } from '../services/dashboardService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const cardVar = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) }

function DashboardRector() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getDashboardRector().then(r => setData(r.data)).catch(() => setData(null)).finally(() => setCargando(false))
  }, [])

  const total = data ? (data.resumenFinanciero.totalCobrado + data.resumenFinanciero.totalPendiente + data.resumenFinanciero.totalVencido) : 1
  const pct = (val) => total > 0 ? Math.min(Math.round((val / total) * 100), 100) : 0

  const kpis = data ? [
    { Icon: DollarSign, label: 'Total ingresos cobrados', val: `S/ ${data.totalIngresos.toFixed(2)}`, sub: 'Pagos confirmados', color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { Icon: AlertTriangle, label: 'Deudas vencidas', val: data.deudasVencidas, sub: `S/ ${data.montoDeudaTotal.toFixed(2)} en mora`, color: data.deudasVencidas > 0 ? 'var(--danger-text)' : 'var(--text-secondary)', bg: data.deudasVencidas > 0 ? 'var(--danger-bg)' : 'var(--bg-elevated)' },
    { Icon: Lock, label: 'Restricciones activas', val: data.restriccionesActivas, sub: `${data.estudiantesConAccesoActivo} con acceso digital`, color: data.restriccionesActivas > 0 ? 'var(--warning-text)' : 'var(--text-secondary)', bg: data.restriccionesActivas > 0 ? 'var(--warning-bg)' : 'var(--bg-elevated)' },
    { Icon: BarChart2, label: 'Ocupación promedio aulas', val: `${data.ocupacionPromedio}%`, sub: 'Ratio matrículas / capacidad', color: 'var(--info-text)', bg: 'var(--info-bg)' },
  ] : []

  return (
    <PageShell role="admin" navTitle="Dashboard Estratégico">
      <PageHeader title="Dashboard Estratégico" subtitle="Vista ejecutiva del estado financiero y académico institucional" />

      {cargando && <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Cargando indicadores estratégicos...</div>}
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
              <div style={{ fontSize: '22px', fontWeight: '800', color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', margin: '6px 0 3px' }}>{k.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Resumen financiero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '24px' }}>Resumen financiero</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { label: 'Total cobrado', val: data.resumenFinanciero.totalCobrado, color: 'var(--success-text)', barBg: 'var(--success-bg)' },
              { label: 'Total pendiente', val: data.resumenFinanciero.totalPendiente, color: 'var(--warning-text)', barBg: 'var(--warning-bg)' },
              { label: 'Total vencido (mora)', val: data.resumenFinanciero.totalVencido, color: 'var(--danger-text)', barBg: 'var(--danger-bg)' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>{f.label}</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: f.color }}>S/ {f.val.toFixed(2)}</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-elevated)', borderRadius: '5px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct(f.val)}%` }} transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
                    style={{ height: '100%', background: f.color, borderRadius: '5px' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{pct(f.val)}% del total financiero</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tarjetas institucionales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { Icon: GraduationCap, titulo: 'Acceso digital activo', valor: `${data.estudiantesConAccesoActivo} estudiantes`, desc: 'Con al menos un servicio ACTIVO', color: 'var(--success-text)', bg: 'var(--success-bg)' },
            { Icon: BookOpen, titulo: 'Ocupación institucional', valor: `${data.ocupacionPromedio}%`, desc: 'Promedio de uso de aulas y secciones', color: 'var(--info-text)', bg: 'var(--info-bg)' },
            { Icon: XCircle, titulo: 'Restricciones vigentes', valor: data.restriccionesActivas, desc: 'Estudiantes con bloqueo activo', color: data.restriccionesActivas > 0 ? 'var(--danger-text)' : 'var(--text-muted)', bg: data.restriccionesActivas > 0 ? 'var(--danger-bg)' : 'var(--bg-elevated)' },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07, duration: 0.4 }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <c.Icon size={20} color={c.color} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{c.titulo}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: c.color, marginBottom: '4px' }}>{c.valor}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </>}
    </PageShell>
  )
}

export default DashboardRector
