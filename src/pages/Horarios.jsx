import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarMisMatriculas } from '../services/matriculaService'
import SidebarEstudiante from '../components/SidebarEstudiante'
import './Horarios.css'
import logoUpn from '../assets/logo-upn.png.png'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const HORAS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]
const COLORES = [
  '#1A3F7A', '#2E74B5', '#059669', '#7C3AED',
  '#DC2626', '#D97706', '#0891B2', '#BE185D'
]

function parsearHorario(horario) {
  if (!horario) return []
  const diasMap = {
    'Lun': 'Lunes', 'Mar': 'Martes',
    'Mie': 'Miércoles', 'Mié': 'Miércoles',
    'Jue': 'Jueves', 'Vie': 'Viernes'
  }
  const bloques = []
  try {
    const partes = horario.trim().split(' ')
    if (partes.length < 2) return []
    const diasStr = partes[0]
    const horaStr = partes[1]
    const [horaInicio, horaFin] = horaStr.split('-')
    if (!horaInicio || !horaFin) return []
    const norm = (h) => `${h.split(':')[0].padStart(2, '0')}:00`
    diasStr.split('-').forEach(d => {
      const dia = diasMap[d.trim()]
      if (dia) bloques.push({
        dia,
        horaInicio: norm(horaInicio),
        horaFin: norm(horaFin)
      })
    })
  } catch { return [] }
  return bloques
}

function calcularFilas(horaInicio, horaFin) {
  return parseInt(horaFin.split(':')[0]) - parseInt(horaInicio.split(':')[0])
}

function Horarios() {
  const navigate = useNavigate()
  const idEstudiante = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarMisMatriculas(idEstudiante)
      const activas = (res.data || []).filter(m => m.estado === 'CONFIRMADA')
      setCursos(activas)
    } catch {
      setCursos([])
    } finally {
      setCargando(false)
    }
  }

  // Construir mapa de horarios
  const horariosMap = {}
  cursos.forEach((c, idx) => {
    const bloques = parsearHorario(c.horario)
    bloques.forEach(b => {
      const key = `${b.dia}-${b.horaInicio}`
      horariosMap[key] = {
        curso: c.curso,
        seccion: c.seccion,
        aula: c.aula,
        horaFin: b.horaFin,
        color: COLORES[idx % COLORES.length],
        filas: calcularFilas(b.horaInicio, b.horaFin)
      }
    })
  })



  return (
    <div className="hor-container">
      <nav className="hor-navbar">
        <div className="hor-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="hor-logo-text">SIGA</span>
          <span className="hor-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="hor-navbar-right">
          <span className="hor-user">👤 {nombre}</span>
          <button className="hor-logout" onClick={() => {
            localStorage.clear(); navigate('/login')
          }}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="hor-body">
        <SidebarEstudiante />

        <main className="hor-main">
          <div className="hor-header">
            <div>
              <h1 className="hor-title">Mis Horarios</h1>
              <p className="hor-subtitle">Periodo 2026-1 · {cursos.length} cursos matriculados</p>
            </div>
          </div>

          {cursos.length > 0 && (
            <div className="hor-leyenda">
              {cursos.map((c, idx) => (
                <div key={idx} className="hor-leyenda-item">
                  <div className="hor-leyenda-dot"
                    style={{ background: COLORES[idx % COLORES.length] }} />
                  <span>{c.curso}</span>
                </div>
              ))}
            </div>
          )}

          {cargando ? (
            <div className="hor-empty">Cargando horarios...</div>
          ) : cursos.length === 0 ? (
            <div className="hor-empty">No tienes cursos matriculados</div>
          ) : (
            <div className="hor-grid-wrap">
              <table className="hor-grid">
                <thead>
                  <tr>
                    <th className="hor-th-hora">Hora</th>
                    {DIAS.map(d => <th key={d} className="hor-th-dia">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {HORAS.map((hora, hi) => (
                    <tr key={hora}>
                      <td className="hor-td-hora">{hora}</td>
                      {DIAS.map(dia => {
                        const key = `${dia}-${hora}`
                        const bloque = horariosMap[key]
                        const estaOcupada = HORAS.slice(0, hi).some(h => {
                          const b = horariosMap[`${dia}-${h}`]
                          if (!b) return false
                          return parseInt(hora) < parseInt(h) + b.filas
                        })
                        if (estaOcupada) return null
                        if (bloque) {
                          return (
                            <td key={dia} rowSpan={bloque.filas}
                              className="hor-td-bloque"
                              style={{ background: bloque.color }}>
                              <div className="hor-bloque-content">
                                <div className="hor-bloque-curso">{bloque.curso}</div>
                                <div className="hor-bloque-info">{bloque.seccion}</div>
                                <div className="hor-bloque-info">{bloque.aula}</div>
                                <div className="hor-bloque-hora">{hora} - {bloque.horaFin}</div>
                              </div>
                            </td>
                          )
                        }
                        return <td key={dia} className="hor-td-vacia" />
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Horarios