import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { listarSecciones } from '../../services/seccionService'
import PageShell from '../../components/PageShell'
import Alert from '../../components/ui/Alert'
import PageHeader from '../../components/ui/PageHeader'

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

function ProgramacionCoordinador() {
  const [secciones, setSecciones] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [filtro, setFiltro] = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarSecciones()
      setSecciones(res.data)
    } catch { mostrarMsg('Error al cargar datos', 'error') }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const seccionesFiltradas = secciones.filter(s =>
    `${s.curso} ${s.docente} ${s.codigo}`.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <PageShell role="coordinador" navTitle="Programación de Clases">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader
        title="Programación de Clases"
        subtitle={`Periodo 2026-1 · ${secciones.length} secciones registradas · Vista de solo lectura`}
      />

      {/* Buscador */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input placeholder="Buscar por curso, docente o código..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ paddingLeft: '34px' }} />
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Curso', 'Docente', 'Aula', 'Horario', 'Cupos', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seccionesFiltradas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No hay secciones registradas</td></tr>
              ) : seccionesFiltradas.map((s, i) => {
                const pct = Math.round((s.matriculados / s.capacidadMaxima) * 100)
                const lleno = s.matriculados >= s.capacidadMaxima
                return (
                  <motion.tr key={s.idSeccion} custom={i} variants={rowVar} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-blue)' }}>{s.codigo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', maxWidth: '180px' }}>{s.curso}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.docente}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.aula}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.horario}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: lleno ? 'var(--danger-text)' : 'var(--success-text)', marginBottom: '4px' }}>{s.matriculados}/{s.capacidadMaxima}</div>
                      <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', width: '60px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: lleno ? 'var(--danger-text)' : 'var(--accent-blue)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: lleno ? 'var(--danger-bg)' : 'var(--success-bg)', color: lleno ? 'var(--danger-text)' : 'var(--success-text)' }}>{s.estado}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}

export default ProgramacionCoordinador
