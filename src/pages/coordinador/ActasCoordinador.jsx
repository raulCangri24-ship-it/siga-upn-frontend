import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { listarActas, cerrarPorCoordinador } from '../../services/actaService'
import PageShell from '../../components/PageShell'
import Alert from '../../components/ui/Alert'
import PageHeader from '../../components/ui/PageHeader'

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

const BADGE = {
  FIRMADA:  { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  BORRADOR: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

function ActasCoordinador() {
  const [actas, setActas] = useState([])
  const [confirmCerrar, setConfirmCerrar] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  useEffect(() => { cargar() }, [])

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

  // HU08-04: Cierre autorizado por coordinador cuando docente no disponible
  const handleCerrar = async () => {
    if (!confirmCerrar) return
    setCargando(true)
    try {
      await cerrarPorCoordinador(confirmCerrar.idActa)
      mostrarMsg('Acta cerrada por coordinador — historial académico actualizado')
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

  return (
    <PageShell role="coordinador" navTitle="Gestión de Actas">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader
        title="Gestión de Actas"
        subtitle={`${actas.length} acta(s) · ${firmadas} firmada(s) · Cierre autorizado por coordinador`}
      />

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

      {/* Modal confirmar firma por coordinador */}
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
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Confirmar cierre por coordinador</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>
                Está a punto de <strong>cerrar</strong> el acta <strong>{confirmCerrar.idActa}</strong> de la sección <strong>{confirmCerrar.idSeccion}</strong> en ausencia del docente.
              </p>
              <p style={{ fontSize: '12px', color: 'var(--danger-text)', marginBottom: '24px', padding: '10px', background: 'var(--danger-bg)', borderRadius: '8px' }}>
                Esta acción es <strong>irreversible</strong>. Se actualizará el historial académico de todos los estudiantes matriculados.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCerrar} disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success-text)', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  {cargando ? 'Procesando...' : 'Confirmar cierre'}
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

export default ActasCoordinador
