import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, ClipboardList, XCircle, CheckCircle, Clock, MapPin, Users, Award } from 'lucide-react'
import { obtenerCursosDisponibles, inscribir, cancelarMatricula, listarMisMatriculas } from '../services/matriculaService'
import { verificarRestriccion } from '../services/deudaService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import BackgroundGradientAnimation from '../components/BackgroundGradientAnimation'

const ID_PERIODO = 'PER001'

const COURSE_GRADIENTS = [
  { start: "rgb(10, 20, 80)", end: "rgb(20, 50, 150)", c1: "37, 99, 235", c2: "59, 130, 246", c3: "99, 162, 255", c4: "29, 78, 216", c5: "147, 197, 253", ptr: "96, 165, 250", accent: '#2563EB' },
  { start: "rgb(30, 10, 80)", end: "rgb(60, 20, 140)", c1: "124, 58, 237", c2: "167, 139, 250", c3: "196, 181, 253", c4: "109, 40, 217", c5: "139, 92, 246", ptr: "167, 139, 250", accent: '#7C3AED' },
  { start: "rgb(0, 50, 40)", end: "rgb(5, 90, 70)", c1: "5, 150, 105", c2: "16, 185, 129", c3: "52, 211, 153", c4: "4, 120, 87", c5: "110, 231, 183", ptr: "52, 211, 153", accent: '#10B981' },
  { start: "rgb(80, 40, 0)", end: "rgb(140, 70, 0)", c1: "245, 173, 39", c2: "251, 191, 36", c3: "217, 119, 6", c4: "180, 83, 9", c5: "252, 211, 77", ptr: "251, 191, 36", accent: '#F5AD27' },
  { start: "rgb(80, 0, 20)", end: "rgb(150, 10, 40)", c1: "220, 38, 38", c2: "248, 113, 113", c3: "252, 165, 165", c4: "185, 28, 28", c5: "254, 202, 202", ptr: "248, 113, 113", accent: '#EF4444' },
]

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

const BADGE_MAT = {
  CONFIRMADA: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  CANCELADA:  { bg: 'var(--danger-bg)',  color: 'var(--danger-text)'  },
  PENDIENTE:  { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

function PortalMatricula() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')

  const [tab, setTab] = useState('disponibles')
  const [cursosDisponibles, setCursosDisponibles] = useState([])
  const [misMatriculas, setMisMatriculas] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [filtro, setFiltro] = useState('')

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      const restriccion = await verificarRestriccion(idEstudiante)
      if (restriccion.data) { navigate('/estudiante/restriccion'); return }
      const [disp, mis] = await Promise.all([
        obtenerCursosDisponibles(idEstudiante, ID_PERIODO),
        listarMisMatriculas(idEstudiante)
      ])
      setCursosDisponibles(disp.data)
      setMisMatriculas(mis.data)
    } catch {
      mostrarMsg('Error al cargar datos de matrícula', 'error')
    }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 5000)
  }

  const handleInscribir = async (seccion) => {
    if (!seccion.prerrequisitoCumplido) { mostrarMsg(`No puedes inscribirte: ${seccion.mensajePrerrequisito}`, 'error'); return }
    if (seccion.cuposDisponibles <= 0) { mostrarMsg('No hay cupos disponibles', 'error'); return }
    setCargando(true)
    try {
      await inscribir({ idMatricula: `MAT${Date.now().toString().slice(-10)}`, idEstudiante, idSeccion: seccion.idSeccion, idPeriodo: ID_PERIODO })
      mostrarMsg(`Inscripción confirmada en ${seccion.nombreCurso}`)
      cargarTodo(); setTab('mis-matriculas')
    } catch (err) { mostrarMsg(err.response?.data || 'Error al inscribirse', 'error') }
    finally { setCargando(false) }
  }

  const handleCancelar = async (idMatricula, nombreCurso) => {
    if (!window.confirm(`¿Cancelar matrícula en ${nombreCurso}?`)) return
    try { await cancelarMatricula(idMatricula); mostrarMsg('Matrícula cancelada'); cargarTodo() }
    catch { mostrarMsg('Error al cancelar matrícula', 'error') }
  }

  const cursosFiltrados = cursosDisponibles.filter(c =>
    c.nombreCurso?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.codigo?.toLowerCase().includes(filtro.toLowerCase())
  )
  const matriculasActivas = misMatriculas.filter(m => m.estado !== 'CANCELADA')

  return (
    <PageShell role="estudiante" navTitle="Portal de Matrícula">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Portal Estudiantil</div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Portal de Matrícula</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Periodo 2026-1 · {matriculasActivas.length} curso(s) inscrito(s)</p>
      </motion.div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'disponibles',    label: `Cursos disponibles (${cursosDisponibles.length})`, Icon: BookOpen },
          { id: 'mis-matriculas', label: `Mis matrículas (${matriculasActivas.length})`,      Icon: ClipboardList },
        ].map(t => (
          <motion.button key={t.id} onClick={() => setTab(t.id)} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', background: tab === t.id ? 'var(--accent-blue)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
            <t.Icon size={14} />{t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB DISPONIBLES */}
        {tab === 'disponibles' && (
          <motion.div key="disponibles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '24px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input placeholder="Buscar por curso o código..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ paddingLeft: '34px' }} />
            </div>

            {cursosFiltrados.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sin cursos disponibles</div>
                <div style={{ fontSize: '12px' }}>No hay cursos disponibles para este periodo</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {cursosFiltrados.map((c, i) => {
                  const g = COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]
                  const pct = Math.round((c.matriculados / c.capacidadMaxima) * 100) || 0
                  const sinCupos = c.cuposDisponibles <= 0
                  const bloqueado = !c.prerrequisitoCumplido

                  return (
                    <motion.div key={c.idSeccion}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', opacity: bloqueado ? 0.75 : 1 }}
                    >
                      {/* Header con gradient animado */}
                      <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                        <BackgroundGradientAnimation
                          key={`mat-${i}`}
                          gradientBackgroundStart={g.start}
                          gradientBackgroundEnd={g.end}
                          firstColor={g.c1} secondColor={g.c2} thirdColor={g.c3}
                          fourthColor={g.c4} fifthColor={g.c5} pointerColor={g.ptr}
                          containerStyle={{ position: 'absolute', inset: 0 }}
                        />
                        <div style={{ position: 'relative', zIndex: 10, padding: '18px 22px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                                {c.codigo}
                              </span>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                                {c.creditos} créditos
                              </span>
                            </div>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                              Ciclo {c.ciclo}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
                            {c.nombreCurso}
                          </h3>
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                        {/* Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                          {[
                            { Icon: Clock,  label: 'Horario', value: c.horario || '—' },
                            { Icon: MapPin, label: 'Aula',    value: c.aula    || '—' },
                          ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${g.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <item.Icon size={13} color={g.accent} />
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '1px' }}>{item.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{item.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Barra cupos */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Users size={11} color="var(--text-muted)" />
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Cupos</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: sinCupos ? 'var(--danger-text)' : 'var(--success-text)' }}>
                              {sinCupos ? 'Sin cupos' : `${c.cuposDisponibles} disponibles`}
                            </span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: i * 0.06 + 0.3, ease: 'easeOut' }}
                              style={{ height: '100%', background: sinCupos ? 'var(--danger-text)' : `linear-gradient(90deg, ${g.accent}, ${g.accent}99)`, borderRadius: '10px', position: 'relative', overflow: 'hidden' }}
                            >
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)', backgroundSize: '200% 100%', animation: 'shimmer 2s ease infinite' }} />
                            </motion.div>
                          </div>
                        </div>

                        {/* Prerrequisito */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px', background: bloqueado ? 'var(--danger-bg)' : 'var(--success-bg)', border: `1px solid ${bloqueado ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, marginBottom: '14px' }}>
                          {bloqueado ? <XCircle size={12} color="var(--danger-text)" /> : <CheckCircle size={12} color="var(--success-text)" />}
                          <span style={{ fontSize: '11px', fontWeight: '600', color: bloqueado ? 'var(--danger-text)' : 'var(--success-text)' }}>
                            {c.mensajePrerrequisito}
                          </span>
                        </div>

                        {/* Botón */}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ opacity: bloqueado || sinCupos ? 1 : 0.85 }}
                          onClick={() => handleInscribir(c)}
                          disabled={bloqueado || sinCupos || cargando}
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: bloqueado || sinCupos ? 'not-allowed' : 'pointer', border: 'none', background: bloqueado || sinCupos ? 'var(--bg-elevated)' : `linear-gradient(135deg, ${g.accent}, ${g.accent}bb)`, color: bloqueado || sinCupos ? 'var(--text-muted)' : '#fff', marginTop: 'auto' }}
                        >
                          {bloqueado ? 'Sin prerrequisito' : sinCupos ? 'Sin cupos' : '+ Inscribirse'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB MIS MATRICULAS */}
        {tab === 'mis-matriculas' && (
          <motion.div key="mis-matriculas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {misMatriculas.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sin matrículas registradas</div>
                <div style={{ fontSize: '12px' }}>Aún no te has inscrito en ningún curso este periodo</div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header)', borderBottom: '2px solid var(--border)' }}>
                      {['Curso', 'Sección', 'Horario', 'Aula', 'Estado', 'Fecha', 'Acción'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {misMatriculas.map((m, i) => {
                      const badge = BADGE_MAT[m.estado] || { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                      return (
                        <motion.tr key={m.idMatricula} custom={i} variants={rowVar} initial="hidden" animate="visible"
                          style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{m.curso}</td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{m.seccion}</td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{m.horario}</td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{m.aula}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{m.estado}</span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{m.fechaMatricula}</td>
                          <td style={{ padding: '14px 16px' }}>
                            {m.estado !== 'CANCELADA' && (
                              <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => handleCancelar(m.idMatricula, m.curso)}
                                style={{ padding: '7px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                Cancelar
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}

export default PortalMatricula