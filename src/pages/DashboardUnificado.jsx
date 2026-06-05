import { useNavigate } from 'react-router-dom'
import logoUpn from '../assets/logo-upn.png.png'
import { motion } from 'framer-motion'
import { GraduationCap, Presentation, TrendingUp, ArrowRight, LogOut, Bell } from 'lucide-react'
import SidebarAdmin from '../components/SidebarAdmin'

const dashboards = [
  {
    titulo: 'Dashboard Estudiantil',
    desc: 'Matrícula, promedios, tasa de deserción, top estudiantes y distribución por estado.',
    Icon: GraduationCap, ruta: '/admin/dashboard/estudiantil', color: '#3B4A5A',
    bg: 'linear-gradient(135deg,#3B4A5A,#2563eb)',
    stats: ['Rendimiento académico', 'Estado de matrículas', 'Deudas activas'],
  },
  {
    titulo: 'Dashboard Docente',
    desc: 'Carga docente, cumplimiento de actas, asistencia promedio y secciones activas.',
    Icon: Presentation, ruta: '/admin/dashboard/docente', color: '#6d28d9',
    bg: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    stats: ['Secciones por docente', 'Cumplimiento actas', 'Promedio asistencia'],
  },
  {
    titulo: 'Dashboard Rector',
    desc: 'Ingresos cobrados, deudas en mora, restricciones activas y ocupación institucional.',
    Icon: TrendingUp, ruta: '/admin/dashboard/rector', color: '#b45309',
    bg: 'linear-gradient(135deg,#b45309,#f59e0b)',
    stats: ['Resumen financiero', 'Restricciones activas', 'Ocupación de aulas'],
  },
]

const cardVar = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' } }),
}

function DashboardUnificado() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre') || 'Administrador'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F5F5F5' }}>

      <nav style={{ height: '60px', background: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SIGA</span>
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· Dashboards</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={17} color="#4a6a96" />
          <span style={{ color: '#8badd4', fontSize: '13px' }}>{nombre}</span>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', cursor: 'pointer', color: '#f87171', fontSize: '12px', fontWeight: '600' }}>
            <LogOut size={13} /> Salir
          </motion.button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        <SidebarAdmin />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Inteligencia institucional</div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#3B4A5A', margin: '0 0 6px 0' }}>Dashboards Estratégicos</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Selecciona un panel para visualizar los indicadores clave de cada área.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {dashboards.map((d, i) => (
              <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', transition: { duration: 0.2 } }}
                onClick={() => navigate(d.ruta)}
                style={{ borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                <div style={{ background: d.bg, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', bottom: -30, right: 30, width: '70px', height: '70px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                  <d.Icon size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
                  <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: '700', margin: '14px 0 0 0' }}>{d.titulo}</h3>
                </div>

                <div style={{ padding: '20px 24px 24px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 16px 0' }}>{d.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {d.stats.map((s) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#374151' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: d.color }}>
                    Ver dashboard <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardUnificado