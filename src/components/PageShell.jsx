import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Bell, Sun, Moon } from 'lucide-react'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarAdmin from './SidebarAdmin'
import SidebarDocente from './SidebarDocente'
import SidebarEstudiante from './SidebarEstudiante'
import SidebarCoordinador from './SidebarCoordinador'
import { useTheme } from '../context/ThemeContext'

const ROLE_LABELS = {
  admin: 'Panel de Administración',
  docente: 'Portal Docente',
  estudiante: 'Portal Estudiantil',
  coordinador: 'Portal Coordinador',
}

const SIDEBARS = {
  admin: SidebarAdmin,
  docente: SidebarDocente,
  estudiante: SidebarEstudiante,
  coordinador: SidebarCoordinador,
}

function PageShell({ role = 'admin', navTitle, children }) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const nombre = localStorage.getItem('nombre') || 'Usuario'
  const Sidebar = SIDEBARS[role]
  const roleLabel = navTitle || ROLE_LABELS[role]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* NAV */}
            <nav style={{
        height: '60px', flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0D0D14',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUpn} alt="UPN" style={{ height: '36px', objectFit: 'contain' }} />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>SIGA</span>
          <span style={{ color: '#344d6b', fontSize: '12px', marginLeft: '4px' }}>· {roleLabel}</span>
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

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div className="shell-sidebar" style={{ height: '100%', flexShrink: 0 }}>
        <Sidebar />
      </div>
        <main
          className="shell-main"
          style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-app)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default PageShell
