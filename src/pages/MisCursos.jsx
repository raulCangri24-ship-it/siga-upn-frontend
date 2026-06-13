import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, CheckSquare, Clock, MapPin, Users, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import { listarSecciones } from '../services/seccionService'
import PageShell from '../components/PageShell'
import BackgroundGradientAnimation from '../components/BackgroundGradientAnimation'

const COURSE_GRADIENTS = [
  { start: "rgb(10, 20, 80)", end: "rgb(20, 50, 150)", c1: "37, 99, 235", c2: "59, 130, 246", c3: "99, 162, 255", c4: "29, 78, 216", c5: "147, 197, 253", ptr: "96, 165, 250", accent: '#2563EB' },
  { start: "rgb(30, 10, 80)", end: "rgb(60, 20, 140)", c1: "124, 58, 237", c2: "167, 139, 250", c3: "196, 181, 253", c4: "109, 40, 217", c5: "139, 92, 246", ptr: "167, 139, 250", accent: '#7C3AED' },
  { start: "rgb(0, 50, 40)", end: "rgb(5, 90, 70)", c1: "5, 150, 105", c2: "16, 185, 129", c3: "52, 211, 153", c4: "4, 120, 87", c5: "110, 231, 183", ptr: "52, 211, 153", accent: '#10B981' },
  { start: "rgb(80, 40, 0)", end: "rgb(140, 70, 0)", c1: "245, 173, 39", c2: "251, 191, 36", c3: "217, 119, 6", c4: "180, 83, 9", c5: "252, 211, 77", ptr: "251, 191, 36", accent: '#F5AD27' },
  { start: "rgb(80, 0, 20)", end: "rgb(150, 10, 40)", c1: "220, 38, 38", c2: "248, 113, 113", c3: "252, 165, 165", c4: "185, 28, 28", c5: "254, 202, 202", ptr: "248, 113, 113", accent: '#EF4444' },
]

const cardVar = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
}

function MisCursos() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre')
  const idDocente = localStorage.getItem('idUsuario')
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarSecciones()
      const misSecciones = res.data.filter(s => s.docente?.includes(nombre) || s.idDocente === idDocente)
      setSecciones(misSecciones)
    } catch {
      setSecciones([])
    } finally {
      setCargando(false)
    }
  }

  return (
    <PageShell role="docente" navTitle="Mis Cursos">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
          Portal Docente
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Mis Cursos
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Periodo 2026-1 · {secciones.length} sección(es) asignada(s)
        </p>
      </motion.div>

      {/* LOADING */}
      {cargando && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '360px', borderRadius: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease infinite' }} />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!cargando && secciones.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '20px', border: '1px dashed var(--border)' }}
        >
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📚</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>Sin secciones asignadas</div>
          <div style={{ fontSize: '13px' }}>No tienes secciones asignadas en este periodo académico.</div>
        </motion.div>
      )}

      {/* CARDS */}
      {!cargando && secciones.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {secciones.map((s, i) => {
            const g = COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]
            const pct = Math.round((s.matriculados / s.capacidadMaxima) * 100) || 0
            const lleno = s.matriculados >= s.capacidadMaxima
            const disponible = s.estado === 'DISPONIBLE'

            return (
              <motion.div
                key={s.idSeccion}
                custom={i}
                variants={cardVar}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  borderRadius: '20px', overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--bg-surface)',
                }}
              >
                {/* Header con gradient animado */}
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                  <BackgroundGradientAnimation
                    key={`course-${i}`}
                    gradientBackgroundStart={g.start}
                    gradientBackgroundEnd={g.end}
                    firstColor={g.c1}
                    secondColor={g.c2}
                    thirdColor={g.c3}
                    fourthColor={g.c4}
                    fifthColor={g.c5}
                    pointerColor={g.ptr}
                    containerStyle={{ position: 'absolute', inset: 0 }}
                  />
                  <div style={{ position: 'relative', zIndex: 10, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} color="#fff" strokeWidth={1.8} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: disponible ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)', border: `1px solid ${disponible ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}` }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: disponible ? '#34D399' : '#F87171' }} />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: disponible ? '#34D399' : '#F87171' }}>
                          {s.estado}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div>
                      <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                          {s.codigo}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px', textShadow: '0 1px 8px rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.curso}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* Info grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                    {[
                      { Icon: Clock,    label: 'Horario',  value: s.horario || '—' },
                      { Icon: MapPin,   label: 'Aula',     value: s.aula || '—' },
                      { Icon: Users,    label: 'Cupos',    value: `${s.matriculados}/${s.capacidadMaxima}` },
                      { Icon: Calendar, label: 'Periodo',  value: s.periodo || '—' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${g.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                          <item.Icon size={13} color={g.accent} />
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '2px' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Barra de ocupación */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <TrendingUp size={11} color="var(--text-muted)" />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Ocupación</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: lleno ? 'var(--danger-text)' : g.accent }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                        style={{ height: '100%', background: lleno ? 'var(--danger-text)' : `linear-gradient(90deg, ${g.accent}, ${g.accent}99)`, borderRadius: '10px', position: 'relative', overflow: 'hidden' }}
                      >
                        {/* Shimmer en la barra */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)', backgroundSize: '200% 100%', animation: 'shimmer 2s ease infinite' }} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ opacity: 0.85 }}
                      onClick={() => navigate('/docente/evaluaciones')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: `${g.accent}18`, color: g.accent, border: `1px solid ${g.accent}30`, borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                    >
                      <FileText size={13} /> Evaluaciones
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ opacity: 0.85 }}
                      onClick={() => navigate('/docente/asistencia')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                    >
                      <CheckSquare size={13} /> Asistencia
                    </motion.button>
                  </div>
                </div>

              </motion.div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

    </PageShell>
  )
}

export default MisCursos