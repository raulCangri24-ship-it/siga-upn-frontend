import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarSecciones } from '../services/seccionService'
import SidebarDocente from '../components/SidebarDocente'

function MisCursos() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre')
  const idDocente = localStorage.getItem('idUsuario')
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarSecciones()
      const misSecciones = res.data.filter(s =>
        s.docente?.includes(nombre) ||
        s.idDocente === idDocente
      )
      setSecciones(misSecciones)
    } catch {
      setSecciones([])
    } finally {
      setCargando(false)
    }
  }

  const colorEstado = (estado) => {
    if (estado === 'DISPONIBLE') return { bg: '#d1fae5', color: '#065f46' }
    return { bg: '#fee2e2', color: '#991b1b' }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f0f4f8' }}>

      {/* NAVBAR */}
      <nav style={{ height:'64px', background:'#0A1628', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'32px', height:'32px', background:'#FFC300', borderRadius:'6px' }} />
          <span style={{ color:'#fff', fontWeight:'700', fontSize:'16px' }}>SIGA</span>
          <span style={{ color:'#666d78', fontSize:'11px' }}>Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <span style={{ color:'#e0e3e8', fontSize:'13px' }}>👤 {nombre}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding:'8px 20px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'13px' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={{ display:'flex', flex:1 }}>
        <SidebarDocente />

        <main style={{ flex:1, padding:'32px', overflowY:'auto' }}>
          <div style={{ marginBottom:'24px' }}>
            <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#161a22' }}>Mis Cursos</h1>
            <p style={{ fontSize:'12px', color:'#666d78', marginTop:'4px' }}>
              Periodo 2026-1 · {secciones.length} secciones asignadas
            </p>
          </div>

          {cargando ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>Cargando...</div>
          ) : secciones.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af', background:'#fff', borderRadius:'12px' }}>
              No tienes secciones asignadas en este periodo
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px' }}>
              {secciones.map(s => {
                const est = colorEstado(s.estado)
                return (
                  <div key={s.idSeccion} style={{ background:'#fff', borderRadius:'12px', padding:'24px', border:'1.5px solid #e0e3e8', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                      <div>
                        <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#161a22', marginBottom:'4px' }}>{s.curso}</h3>
                        <span style={{ background:'#eff6ff', color:'#1d4ed8', padding:'2px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                          {s.codigo}
                        </span>
                      </div>
                      <span style={{ background: est.bg, color: est.color, padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>
                        {s.estado}
                      </span>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                      {[
                        { label:'Horario', value: s.horario || '—' },
                        { label:'Aula', value: s.aula || '—' },
                        { label:'Cupos', value: `${s.matriculados}/${s.capacidadMaxima}` },
                        { label:'Periodo', value: s.periodo || '—' },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize:'10px', textTransform:'uppercase', color:'#9ca3af', fontWeight:'600' }}>{item.label}</div>
                          <div style={{ fontSize:'13px', color:'#374151', fontWeight:'500' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Barra de ocupación */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'11px', color:'#9ca3af' }}>Ocupación</span>
                        <span style={{ fontSize:'11px', fontWeight:'600', color:'#374151' }}>
                          {Math.round((s.matriculados / s.capacidadMaxima) * 100)}%
                        </span>
                      </div>
                      <div style={{ height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden' }}>
                        <div style={{
                          height:'100%',
                          width: `${(s.matriculados / s.capacidadMaxima) * 100}%`,
                          background: s.matriculados >= s.capacidadMaxima ? '#dc2626' : '#1A3F7A',
                          borderRadius:'3px'
                        }} />
                      </div>
                    </div>

                    <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
                      <button
                        onClick={() => navigate('/docente/evaluaciones')}
                        style={{ flex:1, padding:'8px', background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
                        Evaluaciones
                      </button>
                      <button
                        onClick={() => navigate('/docente/asistencia')}
                        style={{ flex:1, padding:'8px', background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
                        Asistencia
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default MisCursos