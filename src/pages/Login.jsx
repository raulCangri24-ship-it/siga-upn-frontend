import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import './Login.css'
import logoUpn from '../assets/logo-upn.png'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const response = await api.post('/api/auth/login', {
        correo,
        contrasena
      })

      const { token, rol, nombre } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      localStorage.setItem('nombre', nombre)
      localStorage.setItem('idUsuario', response.data.idUsuario || '')

      if (rol === 'ADMIN') navigate('/dashboard/admin')
      else if (rol === 'ESTUDIANTE') navigate('/dashboard/estudiante')
      else if (rol === 'DOCENTE') navigate('/dashboard/docente')
      else if (rol === 'RECTOR') navigate('/dashboard/rector')
      else navigate('/login')

    } catch (err) {
      setError(err.response?.data || 'Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row',
      margin: 0, padding: 0, overflow: 'hidden',
    }}>

      {/* Panel izquierdo — dorado con logo */}
      <div style={{
        width: '50%', height: '100%', background: '#F5AD27',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={logoUpn} alt="UPN" style={{ width: '320px', objectFit: 'contain' }} />
      </div>

      {/* Panel derecho — blanco con formulario */}
      <div style={{
        width: '50%', height: '100%', background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>

          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111111', margin: '0 0 6px 0' }}>
            Iniciar sesión
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 28px 0', lineHeight: '1.4' }}>
            Ingresa tus credenciales institucionales para continuar
          </p>

          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', letterSpacing: '0.5px', marginBottom: '6px' }}>
            CORREO INSTITUCIONAL
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@sga.edu.pe"
            required
            style={{
              width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px', color: '#111111',
              outline: 'none', boxSizing: 'border-box', marginBottom: '20px',
            }}
          />

          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', letterSpacing: '0.5px', marginBottom: '6px' }}>
            CONTRASEÑA
          </label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px', color: '#111111',
              outline: 'none', boxSizing: 'border-box', marginBottom: '28px',
            }}
          />

          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', margin: '0 0 16px 0' }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={cargando}
            style={{
              width: '100%', padding: '14px', background: '#F5AD27',
              color: '#ffffff', fontSize: '15px', fontWeight: '700',
              border: 'none', borderRadius: '8px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1,
              marginBottom: '24px',
            }}
          >
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '11px', margin: '0' }}>
            <span style={{ color: '#d1d5db' }}>Sistema Integrado de Gestión Académica · </span>
            <span style={{ color: '#F5AD27', fontWeight: '600' }}>SIGA</span>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Login