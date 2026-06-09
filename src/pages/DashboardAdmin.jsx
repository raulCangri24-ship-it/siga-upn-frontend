import { useNavigate } from 'react-router-dom'
import logoUpn from '../assets/logo-upn.png.png'
import { motion } from 'framer-motion'
import { Users, CalendarDays, Wallet, DollarSign, LayoutDashboard, LogOut, Bell } from 'lucide-react'
import SidebarAdmin from '../components/SidebarAdmin'
import BackgroundGradientAnimation from '../components/BackgroundGradientAnimation'
import GlowCard from '../components/GlowCard'

const accesos = [
  { titulo: 'Gestión de Usuarios',  desc: 'Crear y administrar cuentas del sistema',  Icon: Users,           color: '#3B4A5A', glowColor: 'blue',   ruta: '/admin/usuarios' },
  { titulo: 'Programación',         desc: 'Secciones, aulas y horarios académicos',   Icon: CalendarDays,    color: '#3B4A5A', glowColor: 'blue',   ruta: '/admin/programacion' },
  { titulo: 'Deudas',               desc: 'Gestionar deudas estudiantiles',           Icon: Wallet,          color: '#065f46', glowColor: 'green',  ruta: '/admin/deudas' },
  { titulo: 'Pagos',                desc: 'Registrar y controlar pagos',              Icon: DollarSign,      color: '#6d28d9', glowColor: 'purple', ruta: '/admin/pagos' },
  { titulo: 'Dashboards',           desc: 'Indicadores estudiantiles y estratégicos', Icon: LayoutDashboard, color: '#b45309', glowColor: 'orange', ruta: '/admin/dashboard' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
}

function DashboardAdmin() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre') || 'Administrador'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F5F5F5' }}>

      <nav style={{
        height: '60px', position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
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
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· Panel de Administración</span>
        </div>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={17} color="#4a6a96" />
          <span style={{ color: '#8badd4', fontSize: '13px' }}>{nombre}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', cursor: 'pointer', color: '#f87171', fontSize: '12px', fontWeight: '600' }}>
            <LogOut size={13} /> Salir
          </motion.button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        <SidebarAdmin />

        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

                  <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            borderRadius: '18px', marginBottom: '32px',
            position: 'relative', overflow: 'hidden',
            height: '120px',
          }}>
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
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', padding: '28px 32px',
              zIndex: 10,
            }}>
              <div style={{ color: '#F5AD27', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Bienvenido de vuelta</div>
              <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{nombre}</h1>
              <p style={{ color: '#8badd4', fontSize: '13px', margin: 0 }}>Panel de administración · SIGA-UPN · Periodo 2026-1</p>
            </div>
          </BackgroundGradientAnimation>
        </motion.div>

          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 20px 0' }}>
              Acceso rápido
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
            {accesos.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <GlowCard
                  glowColor={item.glowColor}
                  onClick={() => navigate(item.ruta)}
                  width="100%"
                  style={{ padding: '24px' }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <item.Icon size={20} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#3B4A5A', marginBottom: '6px' }}>
                    {item.titulo}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '12px', color: item.color, fontWeight: '600' }}>
                    Abrir →
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}

export default DashboardAdmin