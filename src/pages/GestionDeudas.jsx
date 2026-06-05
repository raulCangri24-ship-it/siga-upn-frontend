import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarDeudas, registrarDeuda, saldarDeuda } from '../services/deudaService'
import { obtenerEstadoEstudiante } from '../services/sincronizacionService'
import SidebarAdmin from '../components/SidebarAdmin'
import './GestionDeudas.css'
import logoUpn from '../assets/logo-upn.png.png'

const ESTADOS = ['TODOS', 'PENDIENTE', 'VENCIDA', 'PAGADA']

const FORM_INICIAL = {
  idDeuda: '', monto: '', concepto: '',
  fechaVencimiento: '', estado: 'PENDIENTE', idEstudiante: ''
}

function GestionDeudas() {
  const navigate = useNavigate()
  const [deudas, setDeudas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)
  const [syncEstados, setSyncEstados] = useState({})
  const [syncCargando, setSyncCargando] = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarDeudas()
      setDeudas(res.data)
    } catch {
      mostrarMsg('Error al cargar deudas', 'error')
    }
  }

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await registrarDeuda({
        ...form,
        monto: parseFloat(form.monto)
      })
      mostrarMsg('Deuda registrada satisfactoriamente')
      setMostrarForm(false)
      setForm(FORM_INICIAL)
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al registrar deuda', 'error')
    } finally {
      setCargando(false)
    }
  }

  const verificarSync = async () => {
    const idsVencidas = [...new Set(deudas.filter(d => d.estado === 'VENCIDA').map(d => d.idEstudiante))]
    if (idsVencidas.length === 0) {
      mostrarMsg('No hay deudas vencidas para verificar', 'ok')
      return
    }
    setSyncCargando(true)
    try {
      const resultados = await Promise.allSettled(idsVencidas.map(id => obtenerEstadoEstudiante(id)))
      const estados = {}
      resultados.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          estados[idsVencidas[i]] = r.value.data.tieneRestriccion
        }
      })
      setSyncEstados(estados)
      mostrarMsg(`Estado de sincronización cargado para ${idsVencidas.length} estudiante(s)`)
    } catch {
      mostrarMsg('Error al verificar estados de sincronización', 'error')
    } finally {
      setSyncCargando(false)
    }
  }

  const handleSaldar = async (idDeuda, concepto) => {
    if (!window.confirm(`¿Marcar como PAGADA la deuda "${concepto}"?`)) return
    try {
      await saldarDeuda(idDeuda)
      mostrarMsg('Deuda saldada — restricción levantada automáticamente')
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al saldar deuda', 'error')
    }
  }

  const deudaFiltradas = deudas.filter(d => {
    const coincideTexto =
      d.idDeuda?.toLowerCase().includes(filtro.toLowerCase()) ||
      d.concepto?.toLowerCase().includes(filtro.toLowerCase()) ||
      d.idEstudiante?.toLowerCase().includes(filtro.toLowerCase())
    const coincideEstado = filtroEstado === 'TODOS' || d.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  const colorEstado = (estado) => {
    if (estado === 'PAGADA') return 'gd-badge-pagada'
    if (estado === 'VENCIDA') return 'gd-badge-vencida'
    return 'gd-badge-pendiente'
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="gd-container">

      {/* NAVBAR */}
      <nav className="gd-navbar">
        <div className="gd-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="gd-logo-text">SIGA</span>
          <span className="gd-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="gd-logout" onClick={() => {
          localStorage.clear()
          navigate('/login')
        }}>Cerrar sesión</button>
      </nav>

      <div className="gd-body">

        {/* SIDEBAR */}
        <SidebarAdmin />

        {/* MAIN */}
        <main className="gd-main">

          {mensaje && (
            <div className={`gd-alert ${tipoMensaje === 'error' ? 'gd-alert-error' : 'gd-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="gd-header">
            <div>
              <h1 className="gd-title">Gestión de Deudas</h1>
              <p className="gd-subtitle">{deudas.length} deudas registradas · {deudas.filter(d => d.estado === 'VENCIDA').length} vencidas</p>
            </div>
            <div className="gd-header-actions">
              <button className="gd-btn-sync" onClick={verificarSync} disabled={syncCargando}>
                {syncCargando ? 'Verificando...' : 'Verificar sync'}
              </button>
              <button className="gd-btn-primary" onClick={() => {
                setForm(FORM_INICIAL)
                setMostrarForm(true)
              }}>
                + Nueva deuda
              </button>
            </div>
          </div>

          <div className="gd-filtros">
            <input
              className="gd-search"
              placeholder="Buscar por ID, concepto o estudiante..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
            <div className="gd-chips">
              {ESTADOS.map(est => (
                <button
                  key={est}
                  className={`gd-chip ${filtroEstado === est ? 'active' : ''} ${est !== 'TODOS' ? `chip-${est.toLowerCase()}` : ''}`}
                  onClick={() => setFiltroEstado(est)}>
                  {est}
                </button>
              ))}
            </div>
          </div>

          <div className="gd-table-wrap">
            <table className="gd-table">
              <thead>
                <tr>
                  <th>ID Deuda</th>
                  <th>Estudiante</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {deudaFiltradas.length === 0 ? (
                  <tr><td colSpan={7} className="gd-empty">No se encontraron deudas</td></tr>
                ) : (
                  deudaFiltradas.map(d => (
                    <tr key={d.idDeuda}>
                      <td>{d.idDeuda}</td>
                      <td>{d.idEstudiante}</td>
                      <td>{d.concepto}</td>
                      <td><strong>S/ {parseFloat(d.monto).toFixed(2)}</strong></td>
                      <td>{formatFecha(d.fechaVencimiento)}</td>
                      <td>
                        <span className={`gd-badge ${colorEstado(d.estado)}`}>{d.estado}</span>
                        {d.estado === 'VENCIDA' && syncEstados[d.idEstudiante] !== undefined && (
                          <div className={syncEstados[d.idEstudiante] ? 'gd-sync-ok' : 'gd-sync-warn'}>
                            {syncEstados[d.idEstudiante] ? '✓ Restringido' : '⚠ Sin restricción'}
                          </div>
                        )}
                      </td>
                      <td>
                        {d.estado !== 'PAGADA' && (
                          <button className="gd-btn-saldar"
                            onClick={() => handleSaldar(d.idDeuda, d.concepto)}>
                            Saldar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* MODAL FORMULARIO */}
      {mostrarForm && (
        <div className="gd-modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="gd-modal" onClick={e => e.stopPropagation()}>
            <h2>Registrar nueva deuda</h2>
            <form onSubmit={handleGuardar} className="gd-form">

              <div className="gd-row">
                <div className="gd-field">
                  <label>ID DEUDA</label>
                  <input value={form.idDeuda}
                    onChange={e => setForm({...form, idDeuda: e.target.value})}
                    placeholder="Ej: DEU002" required maxLength={15} />
                </div>
                <div className="gd-field">
                  <label>ID ESTUDIANTE</label>
                  <input value={form.idEstudiante}
                    onChange={e => setForm({...form, idEstudiante: e.target.value})}
                    placeholder="Ej: USR003" required maxLength={15} />
                </div>
              </div>

              <div className="gd-field">
                <label>CONCEPTO</label>
                <input value={form.concepto}
                  onChange={e => setForm({...form, concepto: e.target.value})}
                  placeholder="Ej: Pensión Mayo 2026" required maxLength={150} />
              </div>

              <div className="gd-row">
                <div className="gd-field">
                  <label>MONTO (S/)</label>
                  <input type="number" step="0.01" min="0" value={form.monto}
                    onChange={e => setForm({...form, monto: e.target.value})}
                    placeholder="0.00" required />
                </div>
                <div className="gd-field">
                  <label>FECHA VENCIMIENTO</label>
                  <input type="date" value={form.fechaVencimiento}
                    onChange={e => setForm({...form, fechaVencimiento: e.target.value})}
                    required />
                </div>
              </div>

              <div className="gd-field">
                <label>ESTADO</label>
                <select value={form.estado}
                  onChange={e => setForm({...form, estado: e.target.value})}>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="VENCIDA">VENCIDA (genera restricción automática)</option>
                  <option value="PAGADA">PAGADA</option>
                </select>
                {form.estado === 'VENCIDA' && (
                  <p className="gd-aviso">Se creará automáticamente una restricción de matrícula para este estudiante.</p>
                )}
              </div>

              <div className="gd-form-actions">
                <button type="submit" className="gd-btn-primary" disabled={cargando}>
                  {cargando ? 'Registrando...' : 'Registrar deuda'}
                </button>
                <button type="button" className="gd-btn-secondary"
                  onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default GestionDeudas
