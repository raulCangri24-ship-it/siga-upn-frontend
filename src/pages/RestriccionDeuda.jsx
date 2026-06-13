import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Home, RefreshCw, AlertTriangle } from 'lucide-react'
import { verificarRestriccion } from '../services/deudaService'
import PageShell from '../components/PageShell'

function RestriccionDeuda() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')

  const [deuda, setDeuda] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await verificarRestriccion(idEstudiante)
        if (res.data) { setDeuda(res.data) }
        else { navigate('/estudiante/matricula') }
      } catch { navigate('/estudiante/matricula') }
      finally { setCargando(false) }
    }
    cargar()
  }, [idEstudiante, navigate])

  const formatMonto = (monto) => {
    const num = parseFloat(monto)
    return isNaN(num) ? monto : `S/ ${num.toFixed(2)}`
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
  }

  if (cargando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '14px' }}>
        Verificando estado de cuenta...
      </div>
    )
  }

  return (
    <PageShell role="estudiante" navTitle="Acceso Restringido">
      <div style={{ maxWidth: '560px', margin: '40px auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '40px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>

          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={32} color="var(--danger-text)" />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--danger-text)', marginBottom: '10px' }}>Acceso Restringido</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
            Tu matrícula ha sido bloqueada por una deuda pendiente con la institución.
          </p>

          {deuda && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '24px', marginBottom: '28px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: 'rgba(239,68,68,0.25)', color: 'var(--danger-text)' }}>DEUDA VENCIDA</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Ref: {deuda.idDeuda}</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--danger-text)', marginBottom: '6px' }}>{formatMonto(deuda.monto)}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{deuda.concepto}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '3px' }}>Fecha de vencimiento</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--danger-text)' }}>{formatFecha(deuda.fechaVencimiento)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '3px' }}>Estado</div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: 'rgba(239,68,68,0.25)', color: 'var(--danger-text)' }}>{deuda.estado}</span>
                </div>
              </div>
            </motion.div>
          )}

          <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertTriangle size={16} color="var(--warning-text)" />
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>¿Cómo levantar la restricción?</h3>
            </div>
            <ol style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 2, margin: 0 }}>
              <li>Acércate a <strong style={{ color: 'var(--text-primary)' }}>Caja de Tesorería</strong> (Pabellón A, 1er piso) con tu DNI.</li>
              <li>Realiza el pago de la deuda o suscríbete a un <strong style={{ color: 'var(--text-primary)' }}>plan de pagos</strong>.</li>
              <li>Una vez registrado el pago, el acceso se restablecerá automáticamente.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => navigate('/dashboard/estudiante')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', borderRadius: '10px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <Home size={15} /> Volver al inicio
            </button>
            <button onClick={() => window.location.reload()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', borderRadius: '10px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              <RefreshCw size={15} /> Actualizar estado
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Consultas: <strong>tesoreria@upn.edu.pe</strong> · Interno <strong>1234</strong>
          </p>
        </motion.div>
      </div>
    </PageShell>
  )
}

export default RestriccionDeuda
