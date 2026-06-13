import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { listarMisMatriculas } from '../services/matriculaService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const HORAS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const COLORES = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d', '#1e3a5f']

function parsearHorario(horario) {
  if (!horario) return []
  const diasMap = { 'Lun': 'Lunes', 'Mar': 'Martes', 'Mie': 'Miércoles', 'Mié': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes' }
  try {
    const partes = horario.trim().split(' ')
    if (partes.length < 2) return []
    const diasStr = partes[0]
    const [horaInicio, horaFin] = partes[1].split('-')
    if (!horaInicio || !horaFin) return []
    const norm = (h) => `${h.split(':')[0].padStart(2, '0')}:00`
    const bloques = []
    diasStr.split('-').forEach(d => {
      const dia = diasMap[d.trim()]
      if (dia) bloques.push({ dia, horaInicio: norm(horaInicio), horaFin: norm(horaFin) })
    })
    return bloques
  } catch { return [] }
}

function Horarios() {
  const idEstudiante = localStorage.getItem('idUsuario')
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarMisMatriculas(idEstudiante)
      setCursos((res.data || []).filter(m => m.estado === 'CONFIRMADA'))
    } catch { setCursos([]) }
    finally { setCargando(false) }
  }

  const horariosMap = {}
  cursos.forEach((c, idx) => {
    parsearHorario(c.horario).forEach(b => {
      const key = `${b.dia}-${b.horaInicio}`
      const filas = parseInt(b.horaFin.split(':')[0]) - parseInt(b.horaInicio.split(':')[0])
      horariosMap[key] = { curso: c.curso, seccion: c.seccion, aula: c.aula, horaFin: b.horaFin, color: COLORES[idx % COLORES.length], filas }
    })
  })

  return (
    <PageShell role="estudiante" navTitle="Mis Horarios">
      <PageHeader title="Mis Horarios" subtitle={`Periodo 2026-1 · ${cursos.length} curso(s) matriculado(s)`} />

      {/* Leyenda */}
      {cursos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          {cursos.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 12px', borderRadius: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORES[idx % COLORES.length], flexShrink: 0 }} />
              {c.curso}
            </div>
          ))}
        </div>
      )}

      {cargando && <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando horarios...</div>}
      {!cargando && cursos.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>No tienes cursos matriculados confirmados.</div>
      )}

      {!cargando && cursos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--table-header)' }}>
                  <th style={{ padding: '12px 16px', width: '70px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Hora</th>
                  {DIAS.map(d => (
                    <th key={d} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORAS.map((hora, hi) => (
                  <tr key={hora} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-elevated)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{hora}</td>
                    {DIAS.map(dia => {
                      const key = `${dia}-${hora}`
                      const bloque = horariosMap[key]
                      const estaOcupada = HORAS.slice(0, hi).some(h => {
                        const b = horariosMap[`${dia}-${h}`]
                        return b && parseInt(hora) < parseInt(h) + b.filas
                      })
                      if (estaOcupada) return null
                      if (bloque) {
                        return (
                          <td key={dia} rowSpan={bloque.filas}
                            style={{ padding: '0', borderLeft: '1px solid var(--border)', background: bloque.color, verticalAlign: 'top' }}>
                            <div style={{ padding: '10px 12px', height: '100%' }}>
                              <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>{bloque.curso}</div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{bloque.seccion}</div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{bloque.aula}</div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{hora} – {bloque.horaFin}</div>
                            </div>
                          </td>
                        )
                      }
                      return <td key={dia} style={{ padding: '8px', borderLeft: '1px solid var(--border)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} />
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </PageShell>
  )
}

export default Horarios
