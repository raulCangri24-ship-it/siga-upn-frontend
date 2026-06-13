import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, ClipboardList, UserCheck, FileText } from 'lucide-react'
import logoUpn from '../assets/logo-upn.png.png'
import { useTheme } from '../context/ThemeContext'

const menuItems = [
  { label: 'Inicio',       ruta: '/dashboard/docente',    Icon: Home },
  { label: 'Mis Cursos',   ruta: '/docente/cursos',       Icon: BookOpen },
  { label: 'Evaluaciones', ruta: '/docente/evaluaciones', Icon: ClipboardList },
  { label: 'Asistencia',   ruta: '/docente/asistencia',   Icon: UserCheck },
  { label: 'Actas',        ruta: '/docente/actas',        Icon: FileText },
]

function SidebarDocente() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()

  const brandText = isDark ? '#fff' : '#1a202c'
  const brandSub = isDark ? '#4a6a96' : '#64748b'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'
  const footerText = isDark ? '#344d6b' : '#94a3b8'
  const menuInactiveText = isDark ? '#7090b8' : '#4a5568'
  const menuInactiveIcon = isDark ? '#4a6a96' : '#94a3b8'

  return (
    <aside style={{
      width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      borderRight: `1px solid ${borderColor}`,
      height: '100%',
    }}>

      <div style={{
        position: 'absolute', inset: 0,
        background: isDark ? '#0f121d' : '#ffffff',
        transition: 'background 0.3s ease',
      }} />

      {/* Brand */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '18px 16px 14px',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <img src={logoUpn} alt="UPN" style={{ height: '32px', objectFit: 'contain' }} />
        <div>
          <div style={{ color: brandText, fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>SIGA</div>
          <div style={{ color: brandSub, fontSize: '10px' }}>Portal Docente</div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ position: 'relative', zIndex: 10, flex: 1, padding: '10px 8px' }}>
        {menuItems.map(({ label, ruta, Icon }) => {
          const active = location.pathname === ruta
            || (ruta !== '/dashboard/docente' && location.pathname.startsWith(ruta))
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
              <Icon size={15} color={active ? '#F5AD27' : menuInactiveIcon} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ color: active ? '#F5AD27' : menuInactiveText, fontSize: '13px', fontWeight: active ? '700' : '400' }}>
                {label}
              </span>
            </motion.div>
          )
        })}
      </nav>

      <div style={{
        position: 'relative', zIndex: 10,
        padding: '12px 16px',
        borderTop: `1px solid ${borderColor}`,
        textAlign: 'center', fontSize: '10px', color: footerText
      }}>
        SIGA-UPN · v2025
      </div>
    </aside>
  )
}

export default SidebarDocente