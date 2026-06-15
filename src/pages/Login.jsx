import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import api from '../services/api'
import './Login.css'
import logoUpn from '../assets/logo-upn.png'
import imagenUpn from '../assets/Imagen-upn.png'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)
  const [recordarme, setRecordarme] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const response = await api.post('/api/auth/login', { correo, contrasena })
      const { token, rol, nombre } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      localStorage.setItem('nombre', nombre)
      localStorage.setItem('idUsuario', response.data.idUsuario || '')
      if (rol === 'ADMIN') navigate('/dashboard/admin')
      else if (rol === 'ESTUDIANTE') navigate('/dashboard/estudiante')
      else if (rol === 'DOCENTE') navigate('/dashboard/docente')
      else if (rol === 'RECTOR') navigate('/dashboard/rector')
      else if (rol === 'COORDINADOR') navigate('/coordinador/dashboard')
      else navigate('/login')
    } catch (err) {
      setError(err.response?.data || 'Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Fondo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${imagenUpn})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.45)', zIndex: 0,
      }} />

      {/* Logo + texto izquierda */}
      <div style={{ position: 'absolute', bottom: '60px', left: '60px', zIndex: 2 }}>
        <img src={logoUpn} alt="UPN" style={{ width: '180px', objectFit: 'contain', marginBottom: '20px', display: 'block' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0, lineHeight: 1.6, maxWidth: '280px' }}>
          Inicia sesión para continuar y acceder a tus recursos académicos.
        </p>
      </div>

      {/* Card flotante */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 10,
          background: '#ffffff', borderRadius: '20px',
          padding: '44px 40px', width: '420px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.2)',
        }}
      >

        {/* Icono candado */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245,173,39,0.12)', border: '1px solid rgba(245,173,39,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={24} color="#F5AD27" strokeWidth={1.8} />
          </div>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Iniciar sesión
        </h1>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 28px 0', textAlign: 'center', lineHeight: 1.5 }}>
          Ingresa tu correo institucional y contraseña
        </p>

        {/* Campo correo */}
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
          Correo institucional
        </label>
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type="email" value={correo}
            onChange={e => setCorreo(e.target.value)}
            placeholder="n00331651@upn.pe" required
            className="login-input"
            style={{
              width: '100%', padding: '12px 14px 12px 38px',
              border: '1px solid #e5e7eb', borderRadius: '10px',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#F5AD27'; e.target.style.boxShadow = '0 0 0 3px rgba(245,173,39,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Campo contraseña */}
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
          Contraseña
        </label>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type={verContrasena ? 'text' : 'password'}
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder="••••••••" required
            className="login-input"
            style={{
              width: '100%', padding: '12px 40px 12px 38px',
              border: '1px solid #e5e7eb', borderRadius: '10px',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#F5AD27'; e.target.style.boxShadow = '0 0 0 3px rgba(245,173,39,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
          />
          <button type="button" onClick={() => setVerContrasena(p => !p)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
            {verContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Recordarme */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <input
            type="checkbox" id="recordarme"
            checked={recordarme}
            onChange={e => setRecordarme(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#F5AD27', cursor: 'pointer', marginRight: '8px' }}
          />
          <label htmlFor="recordarme" style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer', userSelect: 'none' }}>
            Recordarme
          </label>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px' }}
          >
            <span style={{ fontSize: '12px', color: '#ef4444' }}>⚠ {error}</span>
          </motion.div>
        )}

        {/* Botón */}
        <motion.button
          type="button" onClick={handleLogin} disabled={cargando}
          whileHover={{ scale: cargando ? 1 : 1.02, boxShadow: cargando ? 'none' : '0 8px 24px rgba(245,173,39,0.45)' }}
          whileTap={{ scale: cargando ? 1 : 0.97 }}
          style={{
            width: '100%', padding: '14px',
            background: cargando ? 'rgba(245,173,39,0.6)' : 'linear-gradient(135deg, #F5AD27, #fb8500)',
            color: '#ffffff', fontSize: '15px', fontWeight: '700',
            border: 'none', borderRadius: '10px',
            cursor: cargando ? 'not-allowed' : 'pointer',
            marginBottom: '20px', letterSpacing: '0.2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 16px rgba(245,173,39,0.3)',
            transition: 'background 0.2s',
          }}
        >
          {cargando ? 'Verificando...' : <>Iniciar sesión <ArrowRight size={16} /></>}
        </motion.button>

        <p style={{ textAlign: 'center', fontSize: '11px', margin: 0, color: '#d1d5db' }}>
          Sistema Integrado de Gestión Académica ·{' '}
          <span style={{ color: '#F5AD27', fontWeight: '700' }}>SIGA-UPN</span>
        </p>

      </motion.div>
    </div>
  )
}

export default Login