import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre')
  const rol = localStorage.getItem('rol')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#f0f4f8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        maxWidth: '480px',
        width: '100%'
      }}>
        <h2 style={{ color: '#1F4E79', marginBottom: '8px' }}>
          Bienvenido, {nombre}
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Rol: <strong>{rol}</strong>
        </p>
        <p style={{ color: '#444', marginBottom: '32px', fontSize: '15px' }}>
          Has iniciado sesión correctamente en el Sistema de Gestión Académica.
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 32px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default Dashboard