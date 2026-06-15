import { Navigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'

const TIEMPO_INACTIVIDAD = 3 * 60 * 60 * 1000 // 3 horas en milisegundos

function RutaProtegida({ children, rolRequerido }) {
  const token = localStorage.getItem('token')
  const rol = localStorage.getItem('rol')

  // Verificar si el token existe
  if (!token) {
    return <Navigate to="/login" />
  }

  // Verificar si el token JWT expiró
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const ahora = Date.now() / 1000
    if (payload.exp < ahora) {
      localStorage.clear()
      return <Navigate to="/login" />
    }
  } catch {
    localStorage.clear()
    return <Navigate to="/login" />
  }

  // Verificar rol
    if (rolRequerido) {
      const rolesPermitidos = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido]
      if (!rolesPermitidos.includes(rol)) {
        return <Navigate to="/login" />
      }
    }

  return (
    <ControlInactividad tiempoLimite={TIEMPO_INACTIVIDAD}>
      {children}
    </ControlInactividad>
  )
}

// Componente que controla la inactividad
function ControlInactividad({ children, tiempoLimite }) {

  const cerrarSesionPorInactividad = useCallback(() => {
    localStorage.clear()
    alert('Tu sesión cerró por inactividad después de 3 horas.')
    window.location.href = '/login'
  }, [])

  useEffect(() => {
    let timer = setTimeout(cerrarSesionPorInactividad, tiempoLimite)

    // Eventos que reinician el contador de inactividad
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(cerrarSesionPorInactividad, tiempoLimite)
    }

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    eventos.forEach(evento => window.addEventListener(evento, resetTimer))

    return () => {
      clearTimeout(timer)
      eventos.forEach(evento => window.removeEventListener(evento, resetTimer))
    }
  }, [cerrarSesionPorInactividad, tiempoLimite])

  return children
}

export default RutaProtegida