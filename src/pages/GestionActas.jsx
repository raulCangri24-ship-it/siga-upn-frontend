import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertTriangle } from 'lucide-react'
import { listarActas, generarActa, cerrarActa } from '../services/actaService'
import { obtenerSeccionesDocente } from '../services/evaluacionService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

const BADGE = {
  FIRMADA: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  BORRADOR: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

function GestionActas() {
  const rolActual = localStorage.getItem('rol')?.toLowerCase() || 'admin'
  const idDocente = localStorage.getItem('idUsuario')

  const [actas, setActas] = useState([])
  const [secciones, setSecciones] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [idSeccionForm, setIdSeccionForm] = useState('')
  const [confirmCerrar, setConfirmCerrar] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [modalError, setModalError] = useState(null)

  useEffect(() => {
    cargar()
    obtenerSeccionesDocente(idDocente)
      .then(r => {
        setSecciones(r.data || [])
        if (r.data?.length > 0) setIdSeccionForm(r.data[0].idSeccion)
      })
      .catch(() => {})
  }, [idDocente])

  const cargar = async () => {
    try {
      const res = await listarActas()
      setActas(res.data || [])
    } catch {
      mostrarMsg('Error al cargar actas', 'error')
    }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const handleGenerar = async (e) => {
    e.preventDefault()
    if (!idSeccionForm) return
    setCargando(true)
    setModalError(null)
    try {
      await generarActa(idSeccionForm, idDocente)
      mostrarMsg('Acta generada satisfactoriamente en estado BORRADOR')
      setMostrarForm(false)
      cargar()
    } catch (err) {
      setModalError(err.response?.data || 'Error al generar acta')
    } finally {
      setCargando(false)
    }
  }

  const handleCerrar = async () => {
    if (!confirmCerrar) return
    setCargando(true)
    try {
      await cerrarActa(confirmCerrar.idActa)
      mostrarMsg('Acta firmada — historial académico actualizado')
      setConfirmCerrar(null)
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al cerrar acta', 'error')
    } finally {
      setCargando(false)
    }
  }

  const actasFiltradas = actas.filter(a => filtroEstado === 'TODOS' || a.estado === filtroEstado)
  const firmadas = actas.filter(a => a.estado === 'FIRMADA').length

  const field = (label, input) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
      {input}
    </div>
  )

  return (
    <PageShell role={rolActual} navTitle="Gestión de Actas">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader title="Gestión de Actas" subtitle={`${actas.length} acta(s) · ${firmadas} firmada(s)`}>
        <button onClick={() => setMostrarForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={13} /> Generar acta
        </button>
      </PageHeader>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['TODOS', 'BORRADOR', 'FIRMADA'].map(est => {
          const badge = BADGE[est]
          const isActive = filtroEstado === est
          return (
            <button key={est} onClick={() => setFiltroEstado(est)}
              style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: isActive ? '1.5px solid transparent' : '1.5px solid var(--border)', background: isActive ? (badge?.bg || 'var(--accent-blue)') : 'transparent', color: isActive ? (badge?.color || '#fff') : 'var(--text-secondary)', transition: 'all 0.15s' }}>
              {est}
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['ID Acta', 'Sección', 'Docente', 'Generación', 'Estado', 'Fecha firma', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actasFiltradas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No hay actas registradas</td></tr>
              ) : actasFiltradas.map((a, i) => {
                const badge = BADGE[a.estado] || { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                return (
                  <motion.tr key={a.idActa} custom={i} variants={rowVar} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{a.idActa}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>{a.idSeccion}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{a.idDocente}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.fechaGeneracion}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{a.estado}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{a.fechaFirma || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {a.estado === 'BORRADOR' && (
                        <button onClick={() => setConfirmCerrar(a)}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          Firmar acta
                        </button>
                      )}
                      {a.estado === 'FIRMADA' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Cerrada</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal generar acta */}
      <Modal open={mostrarForm} onClose={() => { setMostrarForm(false); setModalError(null) }} title="Generar nueva acta" width="460px">
        <form onSubmit={handleGenerar}>
          {field('Sección',
            secciones.length > 0
              ? <select value={idSeccionForm} onChange={e => setIdSeccionForm(e.target.value)}>
                  {secciones.map(s => <option key={s.idSeccion} value={s.idSeccion}>{s.idSeccion} — {s.codigo}</option>)}
                </select>
              : <input value={idSeccionForm} onChange={e => setIdSeccionForm(e.target.value)} placeholder="Ej: SEC001" required />
          )}
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--info-bg)', color: 'var(--info-text)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.6 }}>
            Se generará un acta en estado <strong>BORRADOR</strong>. Una vez firmada, no podrá modificarse y se actualizará el historial académico.
          </div>
          {modalError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: '12px', fontWeight: '600', marginBottom: '14px', border: '1px solid rgba(239,68,68,0.2)' }}>
              {modalError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {cargando ? 'Generando...' : 'Generar acta'}
            </button>
            <button type="button" onClick={() => { setMostrarForm(false); setModalError(null) }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar firma */}
      <AnimatePresence>
        {confirmCerrar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmCerrar(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.94, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 8 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', width: '420px', padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={24} color="var(--warning-text)" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Confirmar firma de acta</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>
                Está a punto de <strong>firmar y cerrar</strong> el acta <strong>{confirmCerrar.idActa}</strong> de la sección <strong>{confirmCerrar.idSeccion}</strong>.
              </p>
              <p style={{ fontSize: '12px', color: 'var(--danger-text)', marginBottom: '24px', padding: '10px', background: 'var(--danger-bg)', borderRadius: '8px' }}>
                Esta acción es <strong>irreversible</strong>. Se actualizará el historial académico de todos los estudiantes matriculados.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCerrar} disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success-text)', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  {cargando ? 'Procesando...' : 'Confirmar firma'}
                </button>
                <button onClick={() => setConfirmCerrar(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}

export default GestionActas
