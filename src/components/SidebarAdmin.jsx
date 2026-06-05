import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Users, CalendarDays, Wallet, DollarSign, LayoutDashboard } from 'lucide-react'
import logoUpn from '../assets/logo-upn.png.png'

const menuItems = [
  { label: 'Inicio',       ruta: '/dashboard/admin',    Icon: Home },
  { label: 'Usuarios',     ruta: '/admin/usuarios',     Icon: Users },
  { label: 'Programación', ruta: '/admin/programacion', Icon: CalendarDays },
  { label: 'Deudas',       ruta: '/admin/deudas',       Icon: Wallet },
  { label: 'Pagos',        ruta: '/admin/pagos',        Icon: DollarSign },
  { label: 'Dashboards',   ruta: '/admin/dashboard',    Icon: LayoutDashboard },
]

function SidebarAdmin() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={{
      width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg,#0A0F1A 0%,#111827 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Brand */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoUpn} alt="UPN" style={{ height: '32px', objectFit: 'contain' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>SIGA</div>
          <div style={{ color: '#4a6a96', fontSize: '10px' }}>Sistema de Gestión Académica</div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        {menuItems.map(({ label, ruta, Icon }) => {
          const active = location.pathname === ruta
            || (ruta !== '/dashboard/admin' && location.pathname.startsWith(ruta))
          return (
            <motion.div
              key={label}
              onClick={() => navigate(ruta)}
              whileHover={{ x: 3, transition: { duration: 0.15 } }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                marginBottom: '2px',
                background: active ? 'rgba(245,173,39,0.12)' : 'transparent',
                borderLeft: active ? '3px solid #F5AD27' : '3px solid transparent',
              }}>
              <Icon size={15} color={active ? '#F5AD27' : '#4a6a96'} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ color: active ? '#F5AD27' : '#7090b8', fontSize: '13px', fontWeight: active ? '700' : '400' }}>
                {label}
              </span>
            </motion.div>
          )
        })}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: '10px', color: '#344d6b' }}>
        SIGA-UPN · v2025
      </div>
    </aside>
  )
}

export default SidebarAdmin
