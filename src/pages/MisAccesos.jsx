import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Wifi, BookOpen, Video } from 'lucide-react'
import { obtenerAccesosEstudiante, reintentarAccesos } from '../services/accesoServicioService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import PageHeader from '../components/ui/PageHeader'

const SERVICIO_INFO = {
  AULA_VIRTUAL: { nombre: 'Aula Virtual', desc: 'Acceso a materiales, tareas y contenido del curso', Icon: BookOpen },
  BIBLIOTECA: { nombre: 'Biblioteca Digital', desc: 'Recursos bibliográficos, bases de datos y revistas', Icon: BookOpen },
  VIDEOCONFERENCIA: { nombre: 'Videoconferencias', desc: 'Clases en línea y sesiones sincrónicas con docentes', Icon: Video },
}

const ESTADO_STYLE = {
  ACTIVO: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  SUSPENDIDO: { bg: 'var(--danger-bg)', color: 'var(--danger-text)' },
  PENDIENTE: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
  'SIN ACCESO': { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' },
}

const cardVar = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
}

function MisAccesos() {
  const idEstudiante = localStorage.getItem('idUsuario')

  const [accesos, setAccesos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')

  useEffect(() => { cargar() }, [idEstudiante])

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await obtenerAccesosEstudiante(idEstudiante)
      setAccesos(res.data || [])
    } catch { setAccesos([]) }
    finally { setCargando(false) }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const handleReintentar = async () => {
    try {
      const res = await reintentarAccesos()
      mostrarMsg(res.data.mensaje)
      cargar()
    } catch { mostrarMsg('Error al reintentar activación', 'error') }
  }

  const hayPendientes = accesos.some(a => a.estado === 'PENDIENTE')
  const haySuspendidos = accesos.some(a => a.estado === 'SUSPENDIDO')

  return (
    <PageShell role="estudiante" navTitle="Mis Accesos">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader title="Mis Accesos a Servicios" subtitle="Estado de tus accesos a plataformas académicas digitales">
        {hayPendientes && (
          <button onClick={handleReintentar}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid rgba(234,179,8,0.3)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Reintentar activación
          </button>
        )}
      </PageHeader>

      {cargando && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>Cargando accesos...</div>
      )}

      {!cargando && accesos.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <Wifi size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '6px' }}>No tienes accesos registrados.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Los accesos se crean automáticamente al confirmar una matrícula.</p>
        </div>
      )}

      {!cargando && accesos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {['AULA_VIRTUAL', 'BIBLIOTECA', 'VIDEOCONFERENCIA'].map((servicio, i) => {
            const acceso = accesos.find(a => a.servicio === servicio)
            const info = SERVICIO_INFO[servicio]
            const estadoKey = acceso ? acceso.estado : 'SIN ACCESO'
            const style = ESTADO_STYLE[estadoKey] || ESTADO_STYLE['SIN ACCESO']
            return (
              <motion.div key={servicio} custom={i} variants={cardVar} initial="hidden" animate="visible"
                style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: `1px solid ${style.color === 'var(--text-muted)' ? 'var(--border)' : style.color}`, padding: '24px', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: style.color }} />
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginTop: '8px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <info.Icon size={22} color={style.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{info.nombre}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>{info.desc}</p>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: style.bg, color: style.color }}>{estadoKey}</span>
                    {acceso && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        {acceso.estado === 'ACTIVO' && acceso.fechaActivacion && `Activo desde ${acceso.fechaActivacion}`}
                        {acceso.estado === 'SUSPENDIDO' && 'Acceso suspendido por restricción financiera'}
                        {acceso.estado === 'PENDIENTE' && `Activación en proceso · Intento ${acceso.intentos}/3`}
                      </div>
                    )}
                    {!acceso && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Matrícula requerida</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!cargando && haySuspendidos && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '12px', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger-text)', fontSize: '13px', lineHeight: 1.6 }}>
          <strong>Accesos suspendidos:</strong> Tienes una restricción financiera activa. Regulariza tu situación en Tesorería para rehabilitar el acceso a los servicios digitales. &nbsp;
          <strong>tesoreria@upn.edu.pe</strong> · Interno <strong>1234</strong>
        </motion.div>
      )}
    </PageShell>
  )
}

export default MisAccesos
