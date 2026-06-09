import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, GraduationCap, BookOpen, Clock, Wallet, Monitor } from 'lucide-react'
import logoUpn from '../assets/logo-upn.png.png'
import BackgroundGradientAnimation from './BackgroundGradientAnimation'

const menuItems = [
  { label: 'Inicio',       ruta: '/dashboard/estudiante', Icon: Home },
  { label: 'Mi Matrícula', ruta: '/estudiante/matricula', Icon: GraduationCap },
  { label: 'Mis Notas',    ruta: '/estudiante/notas',     Icon: BookOpen },
  { label: 'Horarios',     ruta: '/estudiante/horarios',  Icon: Clock },
  { label: 'Mis Pagos',    ruta: '/estudiante/pagos',     Icon: Wallet },
  { label: 'Mis Accesos',  ruta: '/estudiante/accesos',   Icon: Monitor },
]

function SidebarEstudiante() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={{
      width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      borderRight: '1px solid rgba(255,255,255,0.06)',
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

      <div style={{ position: 'relative', zIndex: 10, padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoUpn} alt="UPN" style={{ height: '32px', objectFit: 'contain' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>SIGA</div>
          <div style={{ color: '#4a6a96', fontSize: '10px' }}>Portal Estudiantil</div>
        </div>
      </div>

      <nav style={{ position: 'relative', zIndex: 10, flex: 1, padding: '10px 8px' }}>
        {menuItems.map(({ label, ruta, Icon }) => {
          const active = location.pathname === ruta
            || (ruta !== '/dashboard/estudiante' && location.pathname.startsWith(ruta))
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

      <div style={{ position: 'relative', zIndex: 10, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: '10px', color: '#344d6b' }}>
        SIGA-UPN · v2025
      </div>
    </aside>
  )
}

export default SidebarEstudiante
