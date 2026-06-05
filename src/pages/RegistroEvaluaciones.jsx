import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  obtenerSeccionesDocente, obtenerSilabo,
  obtenerNotasSeccion, registrarNota
} from '../services/evaluacionService'
import './RegistroEvaluaciones.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarDocente from '../components/SidebarDocente'

function RegistroEvaluaciones() {
  const navigate = useNavigate()
  const idDocente = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [secciones, setSecciones] = useState([])
  const [idSeccionSel, setIdSeccionSel] = useState('')
  const [silabo, setSilabo] = useState(null)
  const [filas, setFilas] = useState([])
  const [editando, setEditando] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
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

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
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
    let exito = 0
    let error = 0

    for (const nota of fila.notas) {
      const key = `${fila.idEstudiante}_${nota.idEvaluacion}`
      if (!(key in editando)) continue
      const valor = editando[key]
      if (valor === '' || valor === null) continue
      const num = parseFloat(valor)
      if (isNaN(num) || num < 0 || num > 20) { error++; continue }

      try {
        await registrarNota({
          idEstudiante: fila.idEstudiante,
          idEvaluacion: nota.idEvaluacion,
          valor: num
        })
        exito++
      } catch {
        error++
      }
    }

    setGuardando(false)
    if (error > 0) mostrarMsg(`${exito} nota(s) guardada(s), ${error} con error`, 'error')
    else if (exito > 0) mostrarMsg(`${exito} nota(s) registrada(s) satisfactoriamente`)
    cargarDatos()
  }

  const calcularPromedioLocal = (fila) => {
    if (!silabo) return '—'
    let total = 0, totalPeso = 0
    for (const nota of fila.notas) {
      const key = `${fila.idEstudiante}_${nota.idEvaluacion}`
      const valor = key in editando ? parseFloat(editando[key]) : nota.valor
      if (valor !== null && valor !== undefined && !isNaN(valor) && nota.peso !== null) {
        total += valor * (nota.peso / 100)
        totalPeso += nota.peso
      }
    }
    if (totalPeso === 0) return '—'
    return total.toFixed(2)
  }

  const menuItems = [
    { label: 'Inicio',        ruta: '/dashboard/docente' },
    { label: 'Evaluaciones',  ruta: '/docente/evaluaciones' },
    { label: 'Actas',         ruta: '/docente/actas' },
    { label: 'Asistencia',    ruta: null },
  ]

  const evaluaciones = silabo?.evaluaciones ?? []

  return (
    <div className="re-container">

      {/* NAVBAR */}
      <nav className="re-navbar">
        <div className="re-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="re-logo-text">SIGA</span>
          <span className="re-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="re-navbar-right">
          <span className="re-user">👤 {nombre}</span>
          <button className="re-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="re-body">

        {/* SIDEBAR */}
        <SidebarDocente className="re-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`re-menu-item ${i === 1 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarDocente>

        {/* MAIN */}
        <main className="re-main">

          {mensaje && (
            <div className={`re-alert ${tipoMensaje === 'error' ? 're-alert-error' : 're-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="re-header">
            <div>
              <h1 className="re-title">Registro de Evaluaciones</h1>
              <p className="re-subtitle">Ingrese las notas de sus estudiantes por evaluación</p>
            </div>
            <div className="re-seccion-selector">
              <label className="re-label">Sección:</label>
              <select className="re-select"
                value={idSeccionSel}
                onChange={e => setIdSeccionSel(e.target.value)}>
                {secciones.map(s => (
                  <option key={s.idSeccion} value={s.idSeccion}>
                    {s.idSeccion} — {s.codigo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info sílabo */}
          {silabo && (
            <div className="re-silabo-info">
              <span className="re-silabo-formula">
                Fórmula: <strong>{silabo.formulaEvaluacion}</strong>
              </span>
              <div className="re-evals-chips">
                {evaluaciones.map(e => (
                  <span key={e.idEvaluacion} className="re-eval-chip">
                    {e.nombre} · {e.peso}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {!silabo && idSeccionSel && (
            <div className="re-empty">No hay sílabo configurado para esta sección.</div>
          )}

          {silabo && filas.length === 0 && (
            <div className="re-empty">No hay estudiantes matriculados en esta sección.</div>
          )}

          {silabo && filas.length > 0 && (
            <div className="re-table-wrap">
              <table className="re-table">
                <thead>
                  <tr>
                    <th className="re-th-estudiante">Estudiante</th>
                    {evaluaciones.map(e => (
                      <th key={e.idEvaluacion} className="re-th-eval">
                        <div>{e.nombre}</div>
                        <div className="re-th-tipo">{e.tipo} · {e.peso}%</div>
                      </th>
                    ))}
                    <th className="re-th-promedio">Promedio</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(fila => {
                    const promedio = calcularPromedioLocal(fila)
                    const aprobado = promedio !== '—' && parseFloat(promedio) >= 11
                    return (
                      <tr key={fila.idEstudiante}>
                        <td className="re-td-estudiante">
                          <div className="re-est-nombre">{fila.nombreEstudiante}</div>
                          <div className="re-est-id">{fila.idEstudiante}</div>
                        </td>

                        {fila.notas.map(nota => (
                          <td key={nota.idEvaluacion} className="re-td-nota">
                            <input
                              className="re-nota-input"
                              type="number"
                              min="0" max="20" step="0.5"
                              placeholder="—"
                              value={getValorEditando(fila.idEstudiante, nota.idEvaluacion, nota.valor)}
                              onChange={e => handleCambioNota(
                                fila.idEstudiante, nota.idEvaluacion, e.target.value)}
                            />
                          </td>
                        ))}

                        <td className="re-td-promedio">
                          <span className={`re-promedio ${promedio === '—' ? '' : aprobado ? 'aprobado' : 'desaprobado'}`}>
                            {promedio}
                          </span>
                          {promedio !== '—' && (
                            <div className={`re-estado-text ${aprobado ? 'aprobado' : 'desaprobado'}`}>
                              {aprobado ? 'Aprobado' : 'Desaprobado'}
                            </div>
                          )}
                        </td>

                        <td>
                          <button
                            className="re-btn-guardar"
                            disabled={guardando}
                            onClick={() => handleGuardarFila(fila)}>
                            Guardar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default RegistroEvaluaciones
