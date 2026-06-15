import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, BookOpen, Award, TrendingUp, ChevronDown } from 'lucide-react'
import {
  obtenerSeccionesDocente, obtenerSilabo,
  obtenerNotasSeccion, registrarNota
} from '../services/evaluacionService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
}

function RegistroEvaluaciones() {
  const idDocente = localStorage.getItem('idUsuario')

  const [secciones, setSecciones] = useState([])
  const [idSeccionSel, setIdSeccionSel] = useState('')
  const [silabo, setSilabo] = useState(null)
  const [filas, setFilas] = useState([])
  const [editando, setEditando] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    obtenerSeccionesDocente(idDocente)
      .then(r => {
        setSecciones(r.data)
        if (r.data.length > 0) setIdSeccionSel(r.data[0].idSeccion)
      })
      .catch(() => mostrarMsg('Error al cargar secciones', 'error'))
  }, [idDocente])

  const cargarDatos = useCallback(async () => {
    if (!idSeccionSel) return
    try {
      const [silaboRes, notasRes] = await Promise.all([
        obtenerSilabo(idSeccionSel),
        obtenerNotasSeccion(idSeccionSel)
      ])
      setSilabo(silaboRes.data || null)
      setFilas(notasRes.data || [])
      setEditando({})
    } catch {
      mostrarMsg('Error al cargar datos de la sección', 'error')
    }
  }, [idSeccionSel])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const getValorEditando = (idEstudiante, idEvaluacion, valorActual) => {
    const key = `${idEstudiante}_${idEvaluacion}`
    return key in editando ? editando[key] : (valorActual !== null && valorActual !== undefined ? String(valorActual) : '')
  }

  const handleCambioNota = (idEstudiante, idEvaluacion, valor) => {
    const key = `${idEstudiante}_${idEvaluacion}`
    setEditando(prev => ({ ...prev, [key]: valor }))
  }

  const handleGuardarFila = async (fila) => {
    if (!silabo) return
    setGuardando(true)
    let exito = 0, error = 0
    for (const nota of fila.notas) {
      const key = `${fila.idEstudiante}_${nota.idEvaluacion}`
      if (!(key in editando)) continue
      const valor = editando[key]
      if (valor === '' || valor === null) continue
      const num = parseFloat(valor)
      if (isNaN(num) || num < 0 || num > 20) { error++; continue }
        try {
          await registrarNota({ idEstudiante: fila.idEstudiante, idEvaluacion: nota.idEvaluacion, valor: num })
          exito++
        } catch (err) {
          error++
          const mensajeError = err.response?.data || 'Error al guardar nota'
          mostrarMsg(mensajeError, 'error')
          setGuardando(false)
          return
        }
    }
    setGuardando(false)
    if (error > 0) mostrarMsg(`${exito} nota(s) guardada(s), ${error} con error`, 'error')
    else if (exito > 0) mostrarMsg(`${exito} nota(s) registrada(s) satisfactoriamente`)
    cargarDatos()
  }

  const calcularPromedioLocal = (fila) => {
    if (!silabo) return null
    let total = 0, totalPeso = 0
    for (const nota of fila.notas) {
      const key = `${fila.idEstudiante}_${nota.idEvaluacion}`
      const valor = key in editando ? parseFloat(editando[key]) : nota.valor
      if (valor !== null && valor !== undefined && !isNaN(valor) && nota.peso !== null) {
        total += valor * (nota.peso / 100)
        totalPeso += nota.peso
      }
    }
    if (totalPeso === 0) return null
    return parseFloat(total.toFixed(2))
  }

  const evaluaciones = silabo?.evaluaciones ?? []

  const aprobados = filas.filter(f => {
    const p = calcularPromedioLocal(f)
    return p !== null && p >= 11
  }).length

  const seccionActual = secciones.find(s => s.idSeccion === idSeccionSel)

  return (
    <PageShell role="docente" navTitle="Registro de Evaluaciones">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            Portal Docente
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            Registro de Evaluaciones
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Ingresa las notas de tus estudiantes por evaluación
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={idSeccionSel}
            onChange={e => setIdSeccionSel(e.target.value)}
            style={{ minWidth: '240px', padding: '10px 36px 10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', appearance: 'none', cursor: 'pointer' }}
          >
            {secciones.map(s => (
              <option key={s.idSeccion} value={s.idSeccion}>{s.idSeccion} — {s.codigo}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </motion.div>

      {/* STAT CARDS */}
      {silabo && filas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}
        >
          {[
            { label: 'Estudiantes', value: filas.length, Icon: BookOpen, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
            { label: 'Aprobados',   value: aprobados,    Icon: Award,    color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
            { label: 'Evaluaciones', value: evaluaciones.length, Icon: TrendingUp, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              style={{ background: 'var(--bg-surface)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <stat.Icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', fontWeight: '500' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* INFO SÍLABO */}
      {silabo && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fórmula:</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {silabo.formulaEvaluacion}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {evaluaciones.map((e, i) => {
                const colors = ['#2563EB', '#7C3AED', '#10B981', '#F5AD27', '#EF4444']
                const c = colors[i % colors.length]
                return (
                  <span key={e.idEvaluacion} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
                    {e.nombre} · {e.peso}%
                  </span>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* EMPTY STATES */}
      {!silabo && idSeccionSel && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sin sílabo configurado</div>
          <div style={{ fontSize: '12px' }}>No hay sílabo configurado para esta sección.</div>
        </div>
      )}

      {silabo && filas.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sin estudiantes matriculados</div>
          <div style={{ fontSize: '12px' }}>No hay estudiantes matriculados en esta sección.</div>
        </div>
      )}

      {/* TABLA */}
      {silabo && filas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', whiteSpace: 'nowrap', minWidth: '200px' }}>
                    Estudiante
                  </th>
                  {evaluaciones.map((e, i) => {
                    const colors = ['#2563EB', '#7C3AED', '#10B981', '#F5AD27', '#EF4444']
                    const c = colors[i % colors.length]
                    return (
                      <th key={e.idEvaluacion} style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: c }}>{e.nombre}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
                          {e.tipo} · {e.peso}%
                        </div>
                      </th>
                    )
                  })}
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Promedio
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => {
                  const promedio = calcularPromedioLocal(fila)
                  const aprobado = promedio !== null && promedio >= 11
                  return (
                    <motion.tr
                      key={fila.idEstudiante}
                      custom={i}
                      variants={rowVar}
                      initial="hidden"
                      animate="visible"
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Estudiante */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                            {fila.nombreEstudiante?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{fila.nombreEstudiante}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fila.idEstudiante}</div>
                          </div>
                        </div>
                      </td>

                      {/* Notas */}
                      {fila.notas.map((nota, ni) => {
                        const colors = ['#2563EB', '#7C3AED', '#10B981', '#F5AD27', '#EF4444']
                        const c = colors[ni % colors.length]
                        const val = getValorEditando(fila.idEstudiante, nota.idEvaluacion, nota.valor)
                        const num = parseFloat(val)
                        const tieneNota = val !== '' && !isNaN(num)
                        return (
                          <td key={nota.idEvaluacion} style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <input
                                type="number" min="0" max="20" step="0.5"
                                placeholder="—"
                                value={val}
                                onChange={e => handleCambioNota(fila.idEstudiante, nota.idEvaluacion, e.target.value)}
                                style={{
                                  width: '70px', textAlign: 'center',
                                  padding: '8px 6px', borderRadius: '10px',
                                  border: tieneNota ? `2px solid ${c}50` : '1px solid var(--border)',
                                  background: tieneNota ? `${c}10` : 'var(--bg-elevated)',
                                  color: tieneNota ? c : 'var(--text-primary)',
                                  fontSize: '15px', fontWeight: '800',
                                  outline: 'none', transition: 'all 0.15s',
                                }}
                              />
                            </div>
                          </td>
                        )
                      })}

                      {/* Promedio */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {promedio === null ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                          >
                            <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '800', background: aprobado ? 'var(--success-bg)' : 'var(--danger-bg)', color: aprobado ? 'var(--success-text)' : 'var(--danger-text)', border: `1px solid ${aprobado ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                              {promedio}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: aprobado ? 'var(--success-text)' : 'var(--danger-text)' }}>
                              {aprobado ? 'APROBADO' : 'DESAPROBADO'}
                            </span>
                          </motion.div>
                        )}
                      </td>

                      {/* Guardar */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ opacity: 0.85 }}
                          onClick={() => handleGuardarFila(fila)}
                          disabled={guardando}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}
                        >
                          <Save size={12} /> Guardar
                        </motion.button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </PageShell>
  )
}

export default RegistroEvaluaciones