import { useNavigate } from 'react-router-dom'
import logoUpn from '../assets/logo-upn.png.png'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Clock, Wallet, Monitor, LogOut, Bell } from 'lucide-react'
import SidebarEstudiante from '../components/SidebarEstudiante'
import BackgroundGradientAnimation from '../components/BackgroundGradientAnimation'
import GlowCard from '../components/GlowCard'

const accesos = [
  { titulo: 'Mi Matrícula',  desc: 'Inscribirte en cursos del periodo actual',      Icon: GraduationCap, color: '#3B4A5A', glowColor: 'blue',   ruta: '/estudiante/matricula' },
  { titulo: 'Mis Notas',    desc: 'Consultar calificaciones y promedios',           Icon: BookOpen,      color: '#6d28d9', glowColor: 'purple', ruta: '/estudiante/notas' },
  { titulo: 'Horarios',     desc: 'Ver horario de clases del periodo',              Icon: Clock,         color: '#3B4A5A', glowColor: 'blue',   ruta: '/estudiante/horarios' },
  { titulo: 'Mis Pagos',    desc: 'Estado de pagos y deudas institucionales',       Icon: Wallet,        color: '#065f46', glowColor: 'green',  ruta: '/estudiante/pagos' },
  { titulo: 'Mis Accesos',  desc: 'Aula virtual, biblioteca y videoconferencias',   Icon: Monitor,       color: '#b45309', glowColor: 'orange', ruta: '/estudiante/accesos' },
]

const cardVar = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
}

function DashboardEstudiante() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre') || 'Estudiante'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F5F5F5' }}>

      <nav style={{ height: '60px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(0, 10, 40)"
          gradientBackgroundEnd="rgb(0, 20, 80)"
          firstColor="30, 80, 200"
          secondColor="10, 50, 180"
          thirdColor="50, 100, 255"
          fourthColor="20, 60, 160"
          fifthColor="80, 120, 220"
          pointerColor="100, 150, 255"
          containerStyle={{ position: 'absolute', inset: 0 }}
        />
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SIGA</span>
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· Portal Estudiantil</span>
        </div>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={17} color="#4a6a96" />
          <span style={{ color: '#8badd4', fontSize: '13px' }}>{nombre}</span>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', cursor: 'pointer', color: '#f87171', fontSize: '12px', fontWeight: '600' }}>
            <LogOut size={13} /> Salir
          </motion.button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        <SidebarEstudiante />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ borderRadius: '18px', marginBottom: '32px', position: 'relative', overflow: 'hidden', height: '120px' }}>
            <BackgroundGradientAnimation
              gradientBackgroundStart="rgb(0, 10, 40)"
              gradientBackgroundEnd="rgb(0, 20, 80)"
              firstColor="30, 80, 200"
              secondColor="10, 50, 180"
              thirdColor="50, 100, 255"
              fourthColor="20, 60, 160"
              fifthColor="80, 120, 220"
              pointerColor="100, 150, 255"
            >
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 32px', zIndex: 10 }}>
                <div style={{ color: '#F5AD27', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Bienvenido</div>
                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{nombre}</h1>
                <p style={{ color: '#8badd4', fontSize: '13px', margin: 0 }}>Portal Estudiantil · SIGA-UPN · Periodo 2026-1</p>
              </div>
            </BackgroundGradientAnimation>
          </motion.div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Mis servicios</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
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
                    style={{ padding: '22px' }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <Icon size={19} color="#fff" strokeWidth={1.8} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#3B4A5A', marginBottom: '5px' }}>{item.titulo}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
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

export default DashboardEstudiante
