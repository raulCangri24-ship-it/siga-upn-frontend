import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { getDashboardRector } from '../services/dashboardService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const PERIODOS = [
  { id: 'PER001', label: '2026-1' },
  { id: 'PER002', label: '2025-2' },
  { id: 'PER003', label: '2025-1' },
]

const PIE_COLORS = { CONFIRMADO: '#22C55E', PROCESANDO: '#F5AD27', ANULADO: '#EF4444' }

const cardVar = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) }

function DashboardRector() {
  const [data, setData]         = useState(null)
  const [cargando, setCargando] = useState(true)
  const [periodo, setPeriodo]   = useState('PER001')

  const cargar = (per) => {
    setCargando(true)
    getDashboardRector(per)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar(periodo) }, [periodo])

  const kpis = data ? [
    { Icon: Building2,  label: 'Aforo total institucional', val: data.totalAforo,      sub: 'Capacidad total de aulas',         color: 'var(--info-text)',    bg: 'var(--info-bg)' },
    { Icon: Users,      label: 'Cupos inscritos',           val: data.cuposInscritos,   sub: `${data.ocupacion}% de ocupación`,  color: 'var(--accent-blue)',  bg: 'var(--info-bg)' },
    { Icon: DollarSign, label: 'Proyección de ingresos',    val: `S/ ${data.proyeccionIngresos?.toFixed(2)}`, sub: 'Total pagado + 70% pendiente', color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { Icon: TrendingUp, label: 'Deuda pendiente',           val: `S/ ${data.deudaPendiente?.toFixed(2)}`,    sub: `S/ ${data.totalPagos?.toFixed(2)} cobrado`, color: data.deudaPendiente > 0 ? 'var(--warning-text)' : 'var(--success-text)', bg: data.deudaPendiente > 0 ? 'var(--warning-bg)' : 'var(--success-bg)' },
  ] : []

  const pieData = (data?.distribucionPagos || []).map(d => ({
    name: d.estado, value: d.monto, cantidad: d.cantidad,
    fill: PIE_COLORS[d.estado] || '#94A3B8',
  }))

  const aforoData = data ? [
    { name: 'Aforo total',    valor: data.totalAforo },
    { name: 'Cupos inscritos', valor: data.cuposInscritos },
  ] : []

  return (
    <PageShell role="rector" navTitle="Dashboard Estratégico">
      <PageHeader title="Dashboard Estratégico del Rector" subtitle="Vista ejecutiva del estado financiero y académico institucional" />

      {/* Select periodo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Periodo:</label>
        <select value={periodo} onChange={e => setPeriodo(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
          {PERIODOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {cargando && <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Cargando indicadores estratégicos...</div>}
      {!cargando && !data && <div style={{ padding: '32px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', textAlign: 'center' }}>No se pudo cargar la información.</div>}

      {!cargando && data && <>
        {/* Badge proyección parcial */}
        {data.proyeccionParcial && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'var(--warning-bg)', border: '1px solid var(--warning-text)', color: 'var(--warning-text)', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
            ⚠ PROYECCIÓN PARCIAL — datos incompletos (existen deudas sin pago registrado)
          </motion.div>
        )}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {kpis.map((k, i) => (
            <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: k.color, borderRadius: '14px 0 0 14px' }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <k.Icon size={18} color={k.color} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', margin: '6px 0 3px' }}>{k.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k.sub}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Pie chart distribución de pagos */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Distribución de pagos</h3>
            {pieData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>Sin pagos registrados</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, props) => [`S/ ${val.toFixed(2)} (${props.payload.cantidad} pagos)`, name]}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Barras aforo vs cupos */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Aforo vs cupos inscritos — {data.periodo}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={aforoData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="valor" name="Cantidad" radius={[6, 6, 0, 0]}>
                  <Cell fill="#3B82F6" />
                  <Cell fill="#22C55E" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--info-text)' }}>{data.ocupacion}%</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>ocupación institucional</span>
            </div>
          </motion.div>
        </div>

        {/* Tabla financiera */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Resumen financiero</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Total deudas',         val: data.totalDeudas,         color: 'var(--danger-text)' },
              { label: 'Total cobrado',         val: data.totalPagos,          color: 'var(--success-text)' },
              { label: 'Deuda pendiente',       val: data.deudaPendiente,      color: 'var(--warning-text)' },
              { label: 'Proyección ingresos',   val: data.proyeccionIngresos,  color: 'var(--info-text)' },
            ].map(f => (
              <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.label}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: f.color }}>S/ {f.val?.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </>}
    </PageShell>
  )
}

export default DashboardRector
