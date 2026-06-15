import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, TrendingDown, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getDashboardEstudiantil } from '../services/dashboardService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const cardVar = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) }

function DashboardEstudiantil() {
  const rolActual = localStorage.getItem('rol')?.toLowerCase() || 'admin'
  const [data, setData]             = useState(null)
  const [cargando, setCargando]     = useState(true)
  const [filtroCarrera, setFiltro]  = useState('TODAS')

  useEffect(() => {
    getDashboardEstudiantil()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }, [])

  const carreras = data ? ['TODAS', ...new Set((data.porCarrera || []).map(c => c.carrera))] : ['TODAS']
  const carreraFiltrada = filtroCarrera !== 'TODAS' ? (data?.porCarrera || []).find(c => c.carrera === filtroCarrera) : null

  const matriculadosActivos = carreraFiltrada ? carreraFiltrada.matriculados : (data?.matriculadosActivos || 0)
  const deserciones         = carreraFiltrada ? carreraFiltrada.deserciones  : (data?.deserciones || 0)
  const totalLocal          = matriculadosActivos + deserciones
  const tasaLocal           = totalLocal > 0 ? ((deserciones / totalLocal) * 100).toFixed(1) : '0.0'

  const kpis = data ? [
    { Icon: Users,       label: 'Total estudiantes',    val: data.totalEstudiantes, color: 'var(--info-text)',    bg: 'var(--info-bg)' },
    { Icon: BookOpen,    label: 'Matriculados activos', val: matriculadosActivos,   color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { Icon: TrendingDown,label: 'Deserciones',          val: deserciones,           color: 'var(--danger-text)',  bg: 'var(--danger-bg)' },
    { Icon: Percent,     label: 'Tasa de deserción',    val: `${tasaLocal}%`,       color: parseFloat(tasaLocal) > 10 ? 'var(--danger-text)' : 'var(--warning-text)', bg: parseFloat(tasaLocal) > 10 ? 'var(--danger-bg)' : 'var(--warning-bg)' },
  ] : []

  return (
    <PageShell role={rolActual} navTitle="Dashboard Estudiantil">
      <PageHeader title="Dashboard Estudiantil" subtitle="Indicadores de matrícula y deserción académica por periodo" />

      {cargando && (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Cargando indicadores...
        </div>
      )}
      {!cargando && !data && (
        <div style={{ padding: '32px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', textAlign: 'center', fontSize: '14px' }}>
          No se pudo cargar la información del dashboard.
        </div>
      )}

      {!cargando && data && <>
        {/* Filtro carrera */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Filtrar por carrera:
          </label>
          <select value={filtroCarrera} onChange={e => setFiltro(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
            {carreras.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* KPI Cards */}
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
            </motion.div>
          ))}
        </div>

        {/* Gráfico comparación periodos */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Comparación de matrículas por periodo
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.comparacionPeriodos || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: '700' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              <Bar dataKey="matriculados" name="Matriculados" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deserciones"  name="Deserciones"  fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tabla por carrera */}
        {(data.porCarrera || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Matrículas por carrera — Periodo actual
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Carrera', 'Matriculados', 'Deserciones', '% Deserción'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.porCarrera.map((c, i) => {
                  const tot  = c.matriculados + c.deserciones
                  const tasa = tot > 0 ? ((c.deserciones / tot) * 100).toFixed(1) : '0.0'
                  const alto = parseFloat(tasa) > 10
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.carrera}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: 'var(--success-text)' }}>{c.matriculados}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: 'var(--danger-text)' }}>{c.deserciones}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: alto ? 'var(--danger-bg)' : 'var(--warning-bg)', color: alto ? 'var(--danger-text)' : 'var(--warning-text)' }}>{tasa}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </>}
    </PageShell>
  )
}

export default DashboardEstudiantil
