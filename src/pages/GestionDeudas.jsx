import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, Search, CheckSquare } from 'lucide-react'
import { listarDeudas, registrarDeuda, saldarDeuda } from '../services/deudaService'
import { obtenerEstadoEstudiante } from '../services/sincronizacionService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

const ESTADOS = ['TODOS', 'PENDIENTE', 'VENCIDA', 'PAGADA']
const FORM_INICIAL = { idDeuda: '', monto: '', concepto: '', fechaVencimiento: '', estado: 'PENDIENTE', idEstudiante: '' }

const BADGE_DEUDA = {
  PAGADA:   { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  VENCIDA:  { bg: 'var(--danger-bg)',  color: 'var(--danger-text)'  },
  PENDIENTE:{ bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
}

function GestionDeudas() {
  const [deudas, setDeudas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [syncEstados, setSyncEstados] = useState({})
  const [syncCargando, setSyncCargando] = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try { const res = await listarDeudas(); setDeudas(res.data) }
    catch { mostrarMsg('Error al cargar deudas', 'error') }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const handleGuardar = async (e) => {
    e.preventDefault(); setCargando(true)
    try {
      await registrarDeuda({ ...form, monto: parseFloat(form.monto) })
      mostrarMsg('Deuda registrada satisfactoriamente')
      setMostrarForm(false); setForm(FORM_INICIAL); cargar()
    } catch (err) { mostrarMsg(err.response?.data || 'Error al registrar deuda', 'error') }
    finally { setCargando(false) }
  }

  const verificarSync = async () => {
    const ids = [...new Set(deudas.filter(d => d.estado === 'VENCIDA').map(d => d.idEstudiante))]
    if (!ids.length) { mostrarMsg('No hay deudas vencidas para verificar', 'success'); return }
    setSyncCargando(true)
    try {
      const res = await Promise.allSettled(ids.map(id => obtenerEstadoEstudiante(id)))
      const estados = {}
      res.forEach((r, i) => { if (r.status === 'fulfilled') estados[ids[i]] = r.value.data.tieneRestriccion })
      setSyncEstados(estados)
      mostrarMsg(`Sync cargado para ${ids.length} estudiante(s)`)
    } catch { mostrarMsg('Error al verificar sync', 'error') }
    finally { setSyncCargando(false) }
  }

  const handleSaldar = async (idDeuda, concepto) => {
    if (!window.confirm(`¿Marcar como PAGADA la deuda "${concepto}"?`)) return
    try {
      await saldarDeuda(idDeuda)
      mostrarMsg('Deuda saldada — restricción levantada automáticamente'); cargar()
    } catch (err) { mostrarMsg(err.response?.data || 'Error al saldar deuda', 'error') }
  }

  const deudaFiltradas = deudas.filter(d => {
    const t = `${d.idDeuda} ${d.concepto} ${d.idEstudiante}`.toLowerCase()
    return t.includes(filtro.toLowerCase()) && (filtroEstado === 'TODOS' || d.estado === filtroEstado)
  })

  const formatFecha = (f) => { if (!f) return '—'; const [y,m,d] = f.split('-'); return `${d}/${m}/${y}` }

  const chip = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      cursor: 'pointer', border: '1px solid',
      background: active ? (label === 'VENCIDA' ? 'var(--danger-text)' : label === 'PAGADA' ? 'var(--success-text)' : label === 'PENDIENTE' ? 'var(--warning-text)' : 'var(--accent-blue)') : 'transparent',
      borderColor: active ? 'transparent' : 'var(--border-input)',
      color: active ? '#fff' : 'var(--text-secondary)',
      transition: 'all 0.15s',
    }}>{label}</button>
  )

  const field = (label, input, hint) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
      {input}
      {hint && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{hint}</p>}
    </div>
  )

  // Stats
  const vencidas = deudas.filter(d => d.estado === 'VENCIDA').length
  const pendientes = deudas.filter(d => d.estado === 'PENDIENTE').length
  const pagadas = deudas.filter(d => d.estado === 'PAGADA').length

  return (
    <PageShell role="admin" navTitle="Gestión de Deudas">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader title="Gestión de Deudas" subtitle={`${deudas.length} deudas registradas`}>
        <button onClick={verificarSync} disabled={syncCargando} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <RefreshCw size={13} className={syncCargando ? 'spin' : ''} /> {syncCargando ? 'Verificando...' : 'Verificar sync'}
        </button>
        <button onClick={() => { setForm(FORM_INICIAL); setMostrarForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={13} /> Nueva deuda
        </button>
      </PageHeader>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Vencidas', val: vencidas, bg: 'var(--danger-bg)', color: 'var(--danger-text)' },
          { label: 'Pendientes', val: pendientes, bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
          { label: 'Pagadas', val: pagadas, bg: 'var(--success-bg)', color: 'var(--success-text)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ fontSize: '26px', fontWeight: '800', color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: s.color, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input placeholder="Buscar por ID, concepto o estudiante..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ paddingLeft: '34px' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {ESTADOS.map(e => chip(e, filtroEstado === e, () => setFiltroEstado(e)))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['ID Deuda', 'Estudiante', 'Concepto', 'Monto', 'Vencimiento', 'Estado', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deudaFiltradas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No se encontraron deudas</td></tr>
              ) : deudaFiltradas.map((d, i) => {
                const badge = BADGE_DEUDA[d.estado] || BADGE_DEUDA.PENDIENTE
                return (
                  <motion.tr key={d.idDeuda} custom={i} variants={rowVar} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.idDeuda}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{d.idEstudiante}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', maxWidth: '200px' }}>{d.concepto}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>S/ {parseFloat(d.monto).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatFecha(d.fechaVencimiento)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{d.estado}</span>
                      {d.estado === 'VENCIDA' && syncEstados[d.idEstudiante] !== undefined && (
                        <div style={{ fontSize: '10px', marginTop: '3px', color: syncEstados[d.idEstudiante] ? 'var(--success-text)' : 'var(--warning-text)' }}>
                          {syncEstados[d.idEstudiante] ? '✓ Restringido' : '⚠ Sin restricción'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {d.estado !== 'PAGADA' && (
                        <button onClick={() => handleSaldar(d.idDeuda, d.concepto)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          <CheckSquare size={12} /> Saldar
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

      {/* Modal */}
      <Modal open={mostrarForm} onClose={() => setMostrarForm(false)} title="Registrar nueva deuda">
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('ID DEUDA', <input value={form.idDeuda} onChange={e => setForm({...form, idDeuda: e.target.value})} placeholder="Ej: DEU002" required maxLength={15} />)}</div>
            <div>{field('ID ESTUDIANTE', <input value={form.idEstudiante} onChange={e => setForm({...form, idEstudiante: e.target.value})} placeholder="Ej: USR003" required maxLength={15} />)}</div>
          </div>
          {field('CONCEPTO', <input value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} placeholder="Ej: Pensión Mayo 2026" required maxLength={150} />)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('MONTO (S/)', <input type="number" step="0.01" min="0" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} placeholder="0.00" required />)}</div>
            <div>{field('FECHA VENCIMIENTO', <input type="date" value={form.fechaVencimiento} onChange={e => setForm({...form, fechaVencimiento: e.target.value})} required />)}</div>
          </div>
          {field('ESTADO',
            <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="VENCIDA">VENCIDA (genera restricción automática)</option>
              <option value="PAGADA">PAGADA</option>
            </select>,
            form.estado === 'VENCIDA' ? '⚠ Se creará una restricción de matrícula automáticamente.' : null
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {cargando ? 'Registrando...' : 'Registrar deuda'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}

export default GestionDeudas
