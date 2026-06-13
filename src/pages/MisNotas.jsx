import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { listarMisMatriculas } from '../services/matriculaService'
import { obtenerNotasEstudiante } from '../services/evaluacionService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'

const cardVar = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
}

function MisNotas() {
  const idEstudiante = localStorage.getItem('idUsuario')
  const [cursosConNotas, setCursosConNotas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const matriculasRes = await listarMisMatriculas(idEstudiante)
        const activas = (matriculasRes.data || []).filter(m => m.estado !== 'CANCELADA')
        const resultados = await Promise.all(
          activas
            .filter((v, i, arr) => arr.findIndex(x => x.seccion === v.seccion) === i)
            .map(async (m) => {
              try {
                const notasRes = await obtenerNotasEstudiante(idEstudiante, m.idSeccion)
                return { nombreCurso: m.curso, idSeccion: m.seccion || m.idSeccion, periodo: m.periodo, ...notasRes.data }
              } catch {
                return { nombreCurso: m.curso, idSeccion: m.seccion || m.idSeccion, periodo: m.periodo, notas: [], promedio: 0, estado: 'SIN NOTAS' }
              }
            })
        )
        setCursosConNotas(resultados)
      } catch { setCursosConNotas([]) }
      finally { setCargando(false) }
    }
    cargar()
  }, [idEstudiante])

  const estadoBadge = (estado) => {
    if (estado === 'APROBADO') return { bg: 'var(--success-bg)', color: 'var(--success-text)' }
    if (estado === 'DESAPROBADO') return { bg: 'var(--danger-bg)', color: 'var(--danger-text)' }
    return { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' }
  }

  const notaColor = (valor) => {
    if (valor === null || valor === undefined) return 'var(--text-muted)'
    return parseFloat(valor) >= 11 ? 'var(--success-text)' : 'var(--danger-text)'
  }

  return (
    <PageShell role="estudiante" navTitle="Mis Notas">
      <PageHeader title="Mis Notas" subtitle="Consulta tus calificaciones por curso y periodo académico" />

      {cargando && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>Cargando notas...</div>
      )}

      {!cargando && cursosConNotas.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          No tienes matrículas activas con notas registradas.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!cargando && cursosConNotas.map((curso, idx) => {
          const badge = estadoBadge(curso.estado)
          const promedioNum = parseFloat(curso.promedio)
          return (
            <motion.div key={idx} custom={idx} variants={cardVar} initial="hidden" animate="visible"
              style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{curso.nombreCurso || '—'}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sección {curso.idSeccion} · Periodo {curso.periodo}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: badge.color, lineHeight: 1 }}>
                    {promedioNum > 0 ? promedioNum.toFixed(2) : '—'}
                  </div>
                  <span style={{ marginTop: '4px', display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badge.bg, color: badge.color }}>{curso.estado}</span>
                </div>
              </div>
              {curso.notas && curso.notas.length > 0 ? (
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {curso.notas.map(n => (
                    <div key={n.idEvaluacion} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{n.nombreEvaluacion}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>{n.tipo} · {n.peso}%</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: notaColor(n.valor) }}>
                        {n.valor !== null && n.valor !== undefined
                          ? parseFloat(n.valor).toFixed(2)
                          : <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sin nota</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>No hay evaluaciones configuradas para este curso.</p>
              )}
            </motion.div>
          )
        })}
      </div>
    </PageShell>
  )
}

export default MisNotas
