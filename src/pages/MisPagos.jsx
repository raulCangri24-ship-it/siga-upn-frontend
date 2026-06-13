import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { listarDeudasEstudiante } from '../services/deudaService'
import { listarPagosPorEstudiante } from '../services/pagoService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const cardVar = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

const BADGE_DEUDA = {
  PAGADA: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  VENCIDA: { bg: 'var(--danger-bg)', color: 'var(--danger-text)' },
  PENDIENTE: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

const BADGE_PAGO = {
  CONFIRMADO: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  ANULADO: { bg: 'var(--danger-bg)', color: 'var(--danger-text)' },
  PROCESANDO: { bg: 'var(--info-bg)', color: 'var(--info-text)' },
}

const formatFecha = (f) => {
  if (!f) return '—'
  if (f.includes('/')) return f
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
}

function MisPagos() {
  const idEstudiante = localStorage.getItem('idUsuario')

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
      } catch { setDeudas([]); setPagos([]) }
      finally { setCargando(false) }
    }
    cargar()
  }, [idEstudiante])

  const deudasActivas = deudas.filter(d => d.estado !== 'PAGADA')
  const deudasVencidas = deudas.filter(d => d.estado === 'VENCIDA')
  const totalPagado = pagos.filter(p => p.estado === 'CONFIRMADO').reduce((acc, p) => acc + parseFloat(p.monto || 0), 0)
  const pagosConfirmados = pagos.filter(p => p.estado === 'CONFIRMADO').length

  const kpis = [
    { Icon: AlertTriangle, label: 'Deudas activas', val: deudasActivas.length, color: deudasActivas.length > 0 ? 'var(--warning-text)' : 'var(--text-secondary)', bg: deudasActivas.length > 0 ? 'var(--warning-bg)' : 'var(--bg-elevated)' },
    { Icon: AlertTriangle, label: 'Deudas vencidas', val: deudasVencidas.length, color: deudasVencidas.length > 0 ? 'var(--danger-text)' : 'var(--text-secondary)', bg: deudasVencidas.length > 0 ? 'var(--danger-bg)' : 'var(--bg-elevated)' },
    { Icon: DollarSign, label: 'Total pagado', val: `S/ ${totalPagado.toFixed(2)}`, color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { Icon: CheckCircle, label: 'Pagos confirmados', val: pagosConfirmados, color: 'var(--info-text)', bg: 'var(--info-bg)' },
  ]

  return (
    <PageShell role="estudiante" navTitle="Mis Pagos">
      <PageHeader title="Mis Pagos" subtitle="Resumen de tu situación financiera con la institución" />

      {/* KPIs */}
      {!cargando && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {kpis.map((k, i) => (
            <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: k.color, borderRadius: '14px 0 0 14px' }} />
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <k.Icon size={16} color={k.color} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '6px' }}>{k.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'deudas', label: `Mis Deudas (${deudas.length})`, Icon: AlertTriangle },
          { id: 'historial', label: `Historial de Pagos (${pagos.length})`, Icon: Clock },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', background: tab === t.id ? 'var(--accent-blue)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
            <t.Icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {cargando && <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando información financiera...</div>}

      {/* Tabla deudas */}
      {!cargando && tab === 'deudas' && (
        deudas.length === 0
          ? <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>No tienes deudas registradas.</div>
          : <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Concepto', 'Monto', 'Vencimiento', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deudas.map((d, i) => {
                    const badge = BADGE_DEUDA[d.estado] || { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                    return (
                      <motion.tr key={d.idDeuda} custom={i} variants={rowVar} initial="hidden" animate="visible"
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.idDeuda}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>{d.concepto}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>S/ {parseFloat(d.monto).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{formatFecha(d.fechaVencimiento)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{d.estado}</span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
      )}

      {/* Tabla historial */}
      {!cargando && tab === 'historial' && (
        pagos.length === 0
          ? <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>No tienes pagos registrados.</div>
          : <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                    {['ID Pago', 'Concepto', 'Deuda asociada', 'Monto', 'Fecha', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p, i) => {
                    const badge = BADGE_PAGO[p.estado] || { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                    return (
                      <motion.tr key={p.idPago} custom={i} variants={rowVar} initial="hidden" animate="visible"
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.idPago}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>{p.concepto}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{p.conceptoDeuda}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '800', color: 'var(--success-text)' }}>S/ {parseFloat(p.monto).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{p.fecha}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{p.estado}</span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
      )}

      {/* Aviso deudas vencidas */}
      {!cargando && deudasVencidas.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '12px', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger-text)', fontSize: '13px', lineHeight: 1.6 }}>
          <strong>Atención:</strong> Tienes {deudasVencidas.length} deuda(s) vencida(s). Acércate a Tesorería para regularizar tu situación y evitar restricciones académicas. &nbsp;
          <strong>tesoreria@upn.edu.pe</strong> · Interno <strong>1234</strong>
        </motion.div>
      )}
    </PageShell>
  )
}

export default MisPagos
