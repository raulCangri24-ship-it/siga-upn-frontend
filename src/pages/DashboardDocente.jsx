import { useNavigate } from 'react-router-dom'
import logoUpn from '../assets/logo-upn.png.png'
import { motion } from 'framer-motion'
import { ClipboardList, UserCheck, FileText, BookOpen, LogOut, Bell, Sun, Moon } from 'lucide-react'
import SidebarDocente from '../components/SidebarDocente'
import BackgroundGradientAnimation from '../components/BackgroundGradientAnimation'
import GlowCard from '../components/GlowCard'
import { useTheme } from '../context/ThemeContext'

const accesos = [
  { titulo: 'Mis Cursos',    desc: 'Ver secciones asignadas y materiales',  Icon: BookOpen,      color: '#3B4A5A', glowColor: 'blue',   ruta: '/docente/cursos' },
  { titulo: 'Evaluaciones',  desc: 'Registrar notas y evaluaciones',        Icon: ClipboardList, color: '#6d28d9', glowColor: 'purple', ruta: '/docente/evaluaciones' },
  { titulo: 'Asistencia',    desc: 'Registrar asistencia de estudiantes',   Icon: UserCheck,     color: '#065f46', glowColor: 'green',  ruta: '/docente/asistencia' },
  { titulo: 'Actas',         desc: 'Generar y firmar actas académicas',     Icon: FileText,      color: '#b45309', glowColor: 'orange', ruta: '/docente/actas' },
]

const cardVar = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
}

function DashboardDocente() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre') || 'Docente'
  const { isDark, toggleTheme } = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        height: '60px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0D0D14',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SIGA</span>
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· Portal Docente</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.button whileTap={{ scale: 0.95 }}
            style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8892A4' }}>
            <Bell size={15} />
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: '#F5AD27', borderRadius: '50%' }} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={toggleTheme}
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8892A4' }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED, #F5AD27)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
              {nombre.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: '#CBD5E0', fontWeight: '500' }}>{nombre}</span>
          </div>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', cursor: 'pointer', color: '#f87171', fontSize: '12px', fontWeight: '600' }}>
            <LogOut size={13} /> Salir
          </motion.button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, alignItems: 'stretch', overflow: 'hidden' }}>
        <SidebarDocente />

        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

          {/* Header bienvenida */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ borderRadius: '18px', marginBottom: '32px', position: 'relative', overflow: 'hidden', height: '120px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <BackgroundGradientAnimation
              gradientBackgroundStart="rgb(0, 10, 40)"
              gradientBackgroundEnd="rgb(15, 5, 50)"
              firstColor="124, 58, 237"
              secondColor="30, 80, 200"
              thirdColor="245, 173, 39"
              fourthColor="20, 60, 160"
              fifthColor="100, 30, 200"
              pointerColor="180, 120, 255"
            >
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px', zIndex: 10,
              }}>
                <div>
                  <div style={{ color: '#F5AD27', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Bienvenido</div>
                  <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{nombre}</h1>
                  <p style={{ color: '#8badd4', fontSize: '13px', margin: 0 }}>Portal Docente · SIGA-UPN · Periodo 2026-1</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(245,173,39,0.15)', border: '1px solid rgba(245,173,39,0.3)', borderRadius: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5AD27' }} />
                  <span style={{ color: '#F5AD27', fontSize: '12px', fontWeight: '600' }}>Sistema activo</span>
                </div>
              </div>
            </BackgroundGradientAnimation>
          </motion.div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Acceso rápido</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
            {accesos.map((item, i) => {
              const { Icon } = item
              return (
                <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <GlowCard
                    glowColor={item.glowColor}
                    onClick={() => navigate(item.ruta)}
                    width="100%"
                    style={{ padding: '24px' }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Icon size={20} color="#fff" strokeWidth={1.8} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>{item.titulo}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                    <div style={{ marginTop: '14px', fontSize: '12px', color: item.color, fontWeight: '600' }}>Abrir →</div>
                  </GlowCard>
                </motion.div>
              )
            })}
          </div>

        </main>
      </div>
    </div>
  )
}

export default DashboardDocente