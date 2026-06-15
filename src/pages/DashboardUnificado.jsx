import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Presentation, ArrowRight } from 'lucide-react'
import PageShell from '../components/PageShell'
import { useTheme } from '../context/ThemeContext'

const dashboards = [
  {
    titulo: 'Dashboard Estudiantil',
    desc: 'Matrícula, promedios, tasa de deserción, top estudiantes y distribución por estado.',
    Icon: GraduationCap, ruta: '/admin/dashboard/estudiantil',
    accent: '#2563EB',
    stats: ['Rendimiento académico', 'Estado de matrículas', 'Deudas activas'],
    bgDark: 'linear-gradient(135deg, #0f2460 0%, #1e3a8a 50%, #2563eb 100%)',
    bgLight: 'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)',
  },
  {
    titulo: 'Dashboard Docente',
    desc: 'Carga docente, cumplimiento de actas, asistencia promedio y secciones activas.',
    Icon: Presentation, ruta: '/admin/dashboard/docente',
    accent: '#7C3AED',
    stats: ['Secciones por docente', 'Cumplimiento actas', 'Promedio asistencia'],
    bgDark: 'linear-gradient(135deg, #2d1b69 0%, #4c1d95 50%, #7c3aed 100%)',
    bgLight: 'linear-gradient(135deg, #ede9fe 0%, #8b5cf6 100%)',
  },
]

const cardVar = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' } }),
}

function DashboardUnificado() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  return (
    <PageShell role="admin" navTitle="Dashboards Estratégicos">

      {/* Keyframe shimmer */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '36px' }}
      >
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
          Inteligencia institucional
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          Dashboards Estratégicos
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Selecciona un panel para visualizar los indicadores clave de cada área institucional.
        </p>
      </motion.div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {dashboards.map((d, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVar}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => navigate(d.ruta)}
            style={{
              borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--card-shadow)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header con shimmer */}
            <div style={{
              height: '140px', position: 'relative', overflow: 'hidden',
              background: isDark ? d.bgDark : d.bgLight,
            }}>
              {/* Shimmer overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease infinite',
              }} />

              <div style={{
                position: 'relative', zIndex: 10, padding: '24px',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', height: '100%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <d.Icon size={22} color="#fff" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    {d.titulo}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 18px 0' }}>
                {d.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', flex: 1 }}>
                {d.stats.map((s) => (
                  <div key={s} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: d.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: d.accent }}>
                Ver dashboard <ArrowRight size={14} />
              </div>
            </div>

          </motion.div>
        ))}
      </div>

    </PageShell>
  )
}

export default DashboardUnificado