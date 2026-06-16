import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, GraduationCap, BookOpen, Clock, Wallet, Monitor, Bell, CheckCheck } from 'lucide-react'
import logoUpn from '../assets/logo-upn.png.png'
import { useTheme } from '../context/ThemeContext'
import { listarNotificaciones, contarNoLeidas, marcarLeida, marcarTodasLeidas } from '../services/notificacionService'

const menuItems = [
  { label: 'Inicio',       ruta: '/dashboard/estudiante', Icon: Home },
  { label: 'Mi Matrícula', ruta: '/estudiante/matricula', Icon: GraduationCap },
  { label: 'Mis Notas',    ruta: '/estudiante/notas',     Icon: BookOpen },
  { label: 'Horarios',     ruta: '/estudiante/horarios',  Icon: Clock },
  { label: 'Mis Pagos',    ruta: '/estudiante/pagos',     Icon: Wallet },
  { label: 'Mis Accesos',  ruta: '/estudiante/accesos',   Icon: Monitor },
]

const TIPO_COLOR = {
  BLOQUEO:    { bg: 'var(--danger-bg)',  color: 'var(--danger-text)' },
  DESBLOQUEO: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
}

const TIPO_ICON = {
  BLOQUEO:    '🔒',
  DESBLOQUEO: '🔓',
}

function SidebarEstudiante() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isDark } = useTheme()
  const idUsuario = localStorage.getItem('idUsuario')

  const [notifs, setNotifs]         = useState([])
  const [noLeidas, setNoLeidas]     = useState(0)
  const [dropOpen, setDropOpen]     = useState(false)
  const dropRef                     = useRef(null)

  const brandText        = isDark ? '#fff' : '#1a202c'
  const brandSub         = isDark ? '#4a6a96' : '#64748b'
  const borderColor      = isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'
  const footerText       = isDark ? '#344d6b' : '#94a3b8'
  const menuInactiveText = isDark ? '#7090b8' : '#4a5568'
  const menuInactiveIcon = isDark ? '#4a6a96' : '#94a3b8'
  const dropBg           = isDark ? '#13172a' : '#ffffff'
  const dropBorder       = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'

  useEffect(() => {
    if (!idUsuario) return
    cargarNoLeidas()
    const interval = setInterval(cargarNoLeidas, 60000)
    return () => clearInterval(interval)
  }, [idUsuario])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const cargarNoLeidas = async () => {
    try {
      const res = await contarNoLeidas(idUsuario)
      setNoLeidas(res.data.count || 0)
    } catch { /* silencioso */ }
  }

  const abrirDropdown = async () => {
    if (!dropOpen) {
      try {
        const res = await listarNotificaciones(idUsuario)
        setNotifs(res.data || [])
        if (noLeidas > 0) {
          marcarTodasLeidas(idUsuario).catch(() => {})
          setNoLeidas(0)
        }
      } catch { setNotifs([]) }
    }
    setDropOpen(p => !p)
  }

  const handleLeerTodas = async () => {
    try {
      await marcarTodasLeidas(idUsuario)
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
    } catch { /* silencioso */ }
  }

  const handleLeerUna = async (n) => {
    if (n.leida) return
    try {
      await marcarLeida(n.idNotificacion)
      setNotifs(prev => prev.map(x => x.idNotificacion === n.idNotificacion ? { ...x, leida: true } : x))
      setNoLeidas(p => Math.max(0, p - 1))
    } catch { /* silencioso */ }
  }

  return (
    <aside style={{
      width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'visible',
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
        <div style={{ flex: 1 }}>
          <div style={{ color: brandText, fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>SIGA</div>
          <div style={{ color: brandSub, fontSize: '10px' }}>Portal Estudiantil</div>
        </div>

        {/* Campana de notificaciones */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={abrirDropdown}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={17} color={noLeidas > 0 ? '#F5AD27' : menuInactiveIcon} strokeWidth={noLeidas > 0 ? 2.2 : 1.8} />
            {noLeidas > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >
                {noLeidas > 9 ? '9+' : noLeidas}
              </motion.span>
            )}
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '32px', left: '-180px',
                  width: '300px', maxHeight: '360px', overflowY: 'auto',
                  background: dropBg, border: `1px solid ${dropBorder}`,
                  borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  zIndex: 1000,
                }}
              >
                {/* Header dropdown */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${dropBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: brandText }}>Notificaciones</span>
                  {noLeidas > 0 && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleLeerTodas}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#F5AD27', fontSize: '11px', fontWeight: '600' }}>
                      <CheckCheck size={12} /> Leer todas
                    </motion.button>
                  )}
                </div>

                {/* Lista */}
                {notifs.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: menuInactiveIcon, fontSize: '12px' }}>
                    Sin notificaciones
                  </div>
                ) : notifs.map(n => {
                  const c = TIPO_COLOR[n.tipo] || { bg: 'var(--info-bg)', color: 'var(--info-text)' }
                  return (
                    <motion.div key={n.idNotificacion} whileHover={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}
                      onClick={() => handleLeerUna(n)}
                      style={{ padding: '12px 16px', borderBottom: `1px solid ${dropBorder}`, cursor: 'pointer', opacity: n.leida ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        {!n.leida && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5AD27', marginTop: '5px', flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', background: c.bg, color: c.color, marginBottom: '4px' }}>
                            {TIPO_ICON[n.tipo] ? `${TIPO_ICON[n.tipo]} ${n.tipo}` : n.tipo}
                          </span>
                          <p style={{ margin: 0, fontSize: '12px', color: brandText, lineHeight: 1.4 }}>{n.mensaje}</p>
                          <span style={{ fontSize: '10px', color: menuInactiveIcon, marginTop: '3px', display: 'block' }}>{n.fecha}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Menu */}
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

export default SidebarEstudiante
