import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Users, BarChart2 } from 'lucide-react'
import logoUpn from '../assets/logo-upn.png.png'
import { useTheme } from '../context/ThemeContext'

const menuItems = [
  { label: 'Dashboard',    ruta: '/rector/dashboard',           Icon: Home },
  { label: 'Estudiantil',  ruta: '/admin/dashboard/estudiantil', Icon: Users },
  { label: 'Análisis',     ruta: '/admin/dashboard/rector',      Icon: BarChart2 },
]

const BRAND_COLOR = '#7C3AED'
const BRAND_BG    = 'rgba(124,58,237,0.12)'

function SidebarRector() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isDark } = useTheme()

  const brandText        = isDark ? '#ffffff' : '#111827'
  const brandSub         = isDark ? 'rgba(255,255,255,0.45)' : '#6b7280'
  const borderColor      = isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0'
  const footerText       = isDark ? 'rgba(255,255,255,0.3)' : '#d1d5db'
  const menuInactiveText = isDark ? 'rgba(255,255,255,0.65)' : '#374151'
  const menuInactiveIcon = isDark ? 'rgba(255,255,255,0.4)'  : '#9ca3af'

  const isActive = (ruta) => location.pathname === ruta || location.pathname.startsWith(ruta)

  return (
    <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: isDark ? '#0D0D14' : '#ffffff', borderRight: `1px solid ${borderColor}`, height: '100%' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${borderColor}` }}>
        <img src={logoUpn} alt="UPN" style={{ width: '80px', objectFit: 'contain', display: 'block', marginBottom: '10px' }} />
        <div style={{ fontSize: '13px', fontWeight: '700', color: brandText, lineHeight: 1.2 }}>SIGA-UPN</div>
        <div style={{ fontSize: '11px', color: brandSub, marginTop: '2px' }}>Portal Rector</div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {menuItems.map(({ label, ruta, Icon }) => {
          const active = isActive(ruta)
          return (
            <motion.button key={ruta} onClick={() => navigate(ruta)}
              whileHover={{ x: active ? 0 : 3 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', background: active ? BRAND_BG : 'transparent', borderLeft: active ? `3px solid ${BRAND_COLOR}` : '3px solid transparent', cursor: 'pointer', marginBottom: '2px', transition: 'background 0.15s' }}>
              <Icon size={16} color={active ? BRAND_COLOR : menuInactiveIcon} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', color: active ? BRAND_COLOR : menuInactiveText }}>{label}</span>
            </motion.button>
          )
        })}
      </nav>

      <div style={{ padding: '14px 20px', borderTop: `1px solid ${borderColor}` }}>
        <div style={{ fontSize: '10px', color: footerText, textAlign: 'center' }}>© 2026 UPN · SIGA</div>
      </div>
    </div>
  )
}

export default SidebarRector
