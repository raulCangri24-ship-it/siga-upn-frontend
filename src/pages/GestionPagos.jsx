import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, CheckCircle, AlertTriangle, Clock, Plus, RefreshCw, Search, Ban, CreditCard } from 'lucide-react'
import { listarTodosPagos, registrarPago, anularPago, crearPlanPago } from '../services/pagoService'
import { listarDeudas } from '../services/deudaService'
import { ejecutarSincronizacion } from '../services/sincronizacionService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

const FORM_INICIAL = { idEstudiante: '', idDeuda: '', monto: '', concepto: '' }
const PLAN_INICIAL = { idDeuda: '', numeroCuotas: 2, fechaInicio: '' }

const BADGE_PAGO = {
  CONFIRMADO: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  ANULADO:    { bg: 'var(--danger-bg)',  color: 'var(--danger-text)'  },
  PROCESANDO: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

function GestionPagos() {
  const [pagos, setPagos] = useState([])
  const [deudas, setDeudas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroTexto, setFiltroTexto] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarPlan, setMostrarPlan] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [planForm, setPlanForm] = useState(PLAN_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const [pRes, dRes] = await Promise.all([listarTodosPagos(), listarDeudas()])
      setPagos(pRes.data || []); setDeudas(dRes.data || [])
    } catch { mostrarMsg('Error al cargar datos', 'error') }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4500)
  }

  const handleRegistrar = async (e) => {
    e.preventDefault(); setCargando(true)
    try {
      await registrarPago({ ...form, monto: parseFloat(form.monto) })
      mostrarMsg('Pago registrado satisfactoriamente')
      setMostrarForm(false); setForm(FORM_INICIAL); cargar()
    } catch (err) { mostrarMsg(err.response?.data || 'Error al registrar pago', 'error') }
    finally { setCargando(false) }
  }

  const handleAnular = async (idPago) => {
    if (!window.confirm(`¿Anular el pago ${idPago}?`)) return
    try { await anularPago(idPago); mostrarMsg('Pago anulado'); cargar() }
    catch (err) { mostrarMsg(err.response?.data || 'Error al anular', 'error') }
  }

  const handleSincronizar = async () => {
    try { const res = await ejecutarSincronizacion(); mostrarMsg(`Sincronización: ${res.data.mensaje}`); cargar() }
    catch { mostrarMsg('Error al sincronizar', 'error') }
  }

  const handleCrearPlan = async (e) => {
    e.preventDefault(); setCargando(true)
    try {
      await crearPlanPago({ ...planForm, numeroCuotas: parseInt(planForm.numeroCuotas) })
      mostrarMsg('Plan de pagos creado — restricción levantada temporalmente')
      setMostrarPlan(false); setPlanForm(PLAN_INICIAL); cargar()
    } catch (err) { mostrarMsg(err.response?.data || 'Error al crear plan', 'error') }
    finally { setCargando(false) }
  }

  const totalCobrado = pagos.filter(p => p.estado === 'CONFIRMADO').reduce((a, p) => a + parseFloat(p.monto || 0), 0)
  const deudasVencidas = deudas.filter(d => d.estado === 'VENCIDA').length
  const deudasPendientes = deudas.filter(d => d.estado !== 'PAGADA').length
  const pagosConf = pagos.filter(p => p.estado === 'CONFIRMADO').length

  const pagosFiltrados = pagos.filter(p => {
    const t = `${p.idPago} ${p.idEstudiante} ${p.nombreEstudiante} ${p.concepto}`.toLowerCase()
    return t.includes(filtroTexto.toLowerCase()) && (filtroEstado === 'TODOS' || p.estado === filtroEstado)
  })

  const chip = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      cursor: 'pointer', border: '1px solid',
      background: active ? 'var(--accent-blue)' : 'transparent',
      borderColor: active ? 'var(--accent-blue)' : 'var(--border-input)',
      color: active ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s',
    }}>{label}</button>
  )

  const field = (label, input, hint) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
      {input}
      {hint && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{hint}</p>}
    </div>
  )

  return (
    <PageShell role="admin" navTitle="Gestión de Pagos">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader title="Gestión de Pagos" subtitle={`${pagos.length} pago(s) registrado(s) en el sistema`}>
        <button onClick={handleSincronizar} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Sincronizar estados
        </button>
        <button onClick={() => { setPlanForm(PLAN_INICIAL); setMostrarPlan(true) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <CreditCard size={13} /> Plan de pagos
        </button>
        <button onClick={() => { setForm(FORM_INICIAL); setMostrarForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={13} /> Registrar pago
        </button>
      </PageHeader>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { Icon: DollarSign, label: 'Total cobrado', val: `S/ ${totalCobrado.toFixed(2)}`, bg: 'var(--success-bg)', color: 'var(--success-text)' },
          { Icon: CheckCircle, label: 'Pagos confirmados', val: pagosConf, bg: 'var(--info-bg)', color: 'var(--info-text)' },
          { Icon: AlertTriangle, label: 'Deudas vencidas', val: deudasVencidas, bg: deudasVencidas > 0 ? 'var(--danger-bg)' : 'var(--bg-elevated)', color: deudasVencidas > 0 ? 'var(--danger-text)' : 'var(--text-secondary)' },
          { Icon: Clock, label: 'Deudas pendientes', val: deudasPendientes, bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.Icon size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: s.color, lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: s.color, opacity: 0.7, marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input placeholder="Buscar por ID, estudiante o concepto..." value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} style={{ paddingLeft: '34px' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['TODOS', 'CONFIRMADO', 'PROCESANDO', 'ANULADO'].map(e => chip(e, filtroEstado === e, () => setFiltroEstado(e)))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['ID Pago', 'Estudiante', 'Concepto', 'Deuda asociada', 'Monto', 'Fecha', 'Estado', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No se encontraron pagos</td></tr>
              ) : pagosFiltrados.map((p, i) => {
                const badge = BADGE_PAGO[p.estado] || BADGE_PAGO.PROCESANDO
                return (
                  <motion.tr key={p.idPago} custom={i} variants={rowVar} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.idPago}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.nombreEstudiante}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.idEstudiante}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '160px' }}>{p.concepto}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{p.conceptoDeuda}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>S/ {parseFloat(p.monto).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.fecha}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{p.estado}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.estado === 'CONFIRMADO' && (
                        <button onClick={() => handleAnular(p.idPago)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          <Ban size={12} /> Anular
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal registrar pago */}
      <Modal open={mostrarForm} onClose={() => setMostrarForm(false)} title="Registrar nuevo pago">
        <form onSubmit={handleRegistrar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('ID ESTUDIANTE', <input value={form.idEstudiante} onChange={e => setForm({...form, idEstudiante: e.target.value})} placeholder="Ej: USR003" required maxLength={15} />)}</div>
            <div>{field('ID DEUDA',
              <select value={form.idDeuda} onChange={e => {
                const d = deudas.find(x => x.idDeuda === e.target.value)
                setForm({ ...form, idDeuda: e.target.value, idEstudiante: d?.idEstudiante || form.idEstudiante, concepto: d ? `Pago: ${d.concepto}` : form.concepto })
              }}>
                <option value="">— Seleccionar deuda —</option>
                {deudas.filter(d => d.estado !== 'PAGADA').map(d => (
                  <option key={d.idDeuda} value={d.idDeuda}>{d.idDeuda} · {d.concepto} (S/ {parseFloat(d.monto).toFixed(2)})</option>
                ))}
              </select>
            )}</div>
          </div>
          {field('CONCEPTO DEL PAGO', <input value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} placeholder="Ej: Pago pensión Mayo 2026" required maxLength={150} />)}
          {field('MONTO (S/)',
            <input type="number" step="0.01" min="0.01" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} placeholder="0.00" required />,
            form.idDeuda && (() => { const d = deudas.find(x => x.idDeuda === form.idDeuda); return d ? `Deuda: S/ ${parseFloat(d.monto).toFixed(2)} · ${parseFloat(form.monto||0) >= parseFloat(d.monto) ? '✓ Salda completo' : 'Pago parcial'}` : null })()
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {cargando ? 'Registrando...' : 'Confirmar pago'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal plan de pagos */}
      <Modal open={mostrarPlan} onClose={() => setMostrarPlan(false)} title="Crear plan de pagos fraccionado">
        <form onSubmit={handleCrearPlan}>
          {field('DEUDA A FRACCIONAR',
            <select value={planForm.idDeuda} onChange={e => setPlanForm({...planForm, idDeuda: e.target.value})} required>
              <option value="">— Seleccionar deuda —</option>
              {deudas.filter(d => d.estado !== 'PAGADA').map(d => (
                <option key={d.idDeuda} value={d.idDeuda}>{d.idDeuda} · {d.concepto} (S/ {parseFloat(d.monto).toFixed(2)}) · {d.idEstudiante}</option>
              ))}
            </select>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('NÚMERO DE CUOTAS', <input type="number" min="2" max="24" value={planForm.numeroCuotas} onChange={e => setPlanForm({...planForm, numeroCuotas: e.target.value})} required />)}</div>
            <div>{field('FECHA DE INICIO', <input type="date" value={planForm.fechaInicio} onChange={e => setPlanForm({...planForm, fechaInicio: e.target.value})} required />)}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--info-bg)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '16px', fontSize: '12px', color: 'var(--info-text)', lineHeight: 1.5 }}>
            Al crear el plan, la restricción de matrícula será <strong>levantada temporalmente</strong> mientras el plan esté vigente.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {cargando ? 'Creando...' : 'Crear plan'}
            </button>
            <button type="button" onClick={() => setMostrarPlan(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}

export default GestionPagos
