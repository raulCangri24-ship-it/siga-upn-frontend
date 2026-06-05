import { useNavigate } from 'react-router-dom'
import logoUpn from '../assets/logo-upn.png.png'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Clock, Wallet, Monitor, LogOut, Bell } from 'lucide-react'
import SidebarEstudiante from '../components/SidebarEstudiante'

const accesos = [
  { titulo: 'Mi Matrícula',  desc: 'Inscribirte en cursos del periodo actual', Icon: GraduationCap, color: '#3B4A5A', ruta: '/estudiante/matricula' },
  { titulo: 'Mis Notas',    desc: 'Consultar calificaciones y promedios',     Icon: BookOpen,      color: '#6d28d9', ruta: '/estudiante/notas' },
  { titulo: 'Horarios',     desc: 'Ver horario de clases del periodo',        Icon: Clock,         color: '#3B4A5A', ruta: '/estudiante/horarios' },
  { titulo: 'Mis Pagos',    desc: 'Estado de pagos y deudas institucionales', Icon: Wallet,        color: '#065f46', ruta: '/estudiante/pagos' },
  { titulo: 'Mis Accesos',  desc: 'Aula virtual, biblioteca y videoconferencias', Icon: Monitor,  color: '#b45309', ruta: '/estudiante/accesos' },
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

      <nav style={{ height: '60px', background: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SIGA</span>
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· Portal Estudiantil</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ background: 'linear-gradient(135deg,#0A0F1A 0%,#111827 100%)', borderRadius: '18px', padding: '28px 32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: '180px', height: '180px', background: 'rgba(245,173,39,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 80, width: '120px', height: '120px', background: 'rgba(245,173,39,0.05)', borderRadius: '50%' }} />
            <div style={{ color: '#F5AD27', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Bienvenido</div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{nombre}</h1>
            <p style={{ color: '#8badd4', fontSize: '13px', margin: 0 }}>Portal Estudiantil · SIGA-UPN · Periodo 2026-1</p>
          </motion.div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Mis servicios</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
            {accesos.map((item, i) => {
              const { Icon } = item
              return (
                <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.14)', transition: { duration: 0.2 } }}
                  onClick={() => navigate(item.ruta)}
                  style={{ background: '#fff', borderRadius: '16px', padding: '22px', cursor: 'pointer', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Icon size={19} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#3B4A5A', marginBottom: '5px' }}>{item.titulo}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
                  <div style={{ marginTop: '14px', fontSize: '12px', color: item.color, fontWeight: '600' }}>Abrir →</div>
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
