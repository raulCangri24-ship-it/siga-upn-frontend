import { useNavigate } from 'react-router-dom'
import logoUpn from '../assets/logo-upn.png.png'
import { motion } from 'framer-motion'
import { Users, CalendarDays, Wallet, DollarSign, LayoutDashboard, LogOut, Bell } from 'lucide-react'
import SidebarAdmin from '../components/SidebarAdmin'

const accesos = [
  { titulo: 'Gestión de Usuarios',  desc: 'Crear y administrar cuentas del sistema', Icon: Users,          color: '#3B4A5A', ruta: '/admin/usuarios' },
  { titulo: 'Programación',         desc: 'Secciones, aulas y horarios académicos',  Icon: CalendarDays,   color: '#3B4A5A', ruta: '/admin/programacion' },
  { titulo: 'Deudas',               desc: 'Gestionar deudas estudiantiles',          Icon: Wallet,         color: '#065f46', ruta: '/admin/deudas' },
  { titulo: 'Pagos',                desc: 'Registrar y controlar pagos',             Icon: DollarSign,     color: '#6d28d9', ruta: '/admin/pagos' },
  { titulo: 'Dashboards',           desc: 'Indicadores estudiantiles y estratégicos', Icon: LayoutDashboard,color: '#b45309', ruta: '/admin/dashboard' },
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
        height: '60px', background: '#0A0F1A', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SIGA</span>
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· Panel de Administración</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              background: 'linear-gradient(135deg, #0A0F1A 0%, #111827 100%)',
              borderRadius: '18px', padding: '28px 32px', marginBottom: '32px',
              position: 'relative', overflow: 'hidden',
            }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: '180px', height: '180px', background: 'rgba(245,173,39,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 80, width: '120px', height: '120px', background: 'rgba(245,173,39,0.05)', borderRadius: '50%' }} />
            <div style={{ color: '#F5AD27', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Bienvenido de vuelta</div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{nombre}</h1>
            <p style={{ color: '#8badd4', fontSize: '13px', margin: 0 }}>Panel de administración · SIGA-UPN · Periodo 2026-1</p>
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
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.14)', transition: { duration: 0.2 } }}
                onClick={() => navigate(item.ruta)}
                style={{
                  background: '#fff', borderRadius: '16px', padding: '24px',
                  cursor: 'pointer', border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
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
              </motion.div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}

export default DashboardAdmin