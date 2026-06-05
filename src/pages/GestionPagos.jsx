import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarTodosPagos, registrarPago, anularPago, crearPlanPago } from '../services/pagoService'
import { listarDeudas } from '../services/deudaService'
import { ejecutarSincronizacion } from '../services/sincronizacionService'
import SidebarAdmin from '../components/SidebarAdmin'
import './GestionPagos.css'
import logoUpn from '../assets/logo-upn.png.png'

const FORM_INICIAL = {
  idEstudiante: '', idDeuda: '', monto: '', concepto: ''
}
const PLAN_INICIAL = {
  idDeuda: '', numeroCuotas: 2, fechaInicio: ''
}

function GestionPagos() {
  const navigate = useNavigate()

  const [pagos, setPagos] = useState([])
  const [deudas, setDeudas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroTexto, setFiltroTexto] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarPlan, setMostrarPlan] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [planForm, setPlanForm] = useState(PLAN_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const [pRes, dRes] = await Promise.all([listarTodosPagos(), listarDeudas()])
      setPagos(pRes.data || [])
      setDeudas(dRes.data || [])
    } catch {
      mostrarMsg('Error al cargar datos', 'error')
    }
  }

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4500)
  }

  const handleRegistrar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await registrarPago({ ...form, monto: parseFloat(form.monto) })
      mostrarMsg('Pago registrado satisfactoriamente')
      setMostrarForm(false)
      setForm(FORM_INICIAL)
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al registrar pago', 'error')
    } finally {
      setCargando(false)
    }
  }

  const handleAnular = async (idPago) => {
    if (!window.confirm(`¿Anular el pago ${idPago}? Esta acción puede reactivar la deuda asociada.`)) return
    try {
      await anularPago(idPago)
      mostrarMsg('Pago anulado satisfactoriamente')
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al anular pago', 'error')
    }
  }

  const handleSincronizar = async () => {
    try {
      const res = await ejecutarSincronizacion()
      mostrarMsg(`Sincronización completada: ${res.data.mensaje}`)
      cargar()
    } catch {
      mostrarMsg('Error al sincronizar estados financieros', 'error')
    }
  }

  const handleCrearPlan = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await crearPlanPago({ ...planForm, numeroCuotas: parseInt(planForm.numeroCuotas) })
      mostrarMsg('Plan de pagos creado — restricción levantada temporalmente')
      setMostrarPlan(false)
      setPlanForm(PLAN_INICIAL)
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al crear plan de pagos', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Stats
  const totalCobrado = pagos
    .filter(p => p.estado === 'CONFIRMADO')
    .reduce((acc, p) => acc + parseFloat(p.monto || 0), 0)
  const deudasVencidas = deudas.filter(d => d.estado === 'VENCIDA').length
  const deudasPendientes = deudas.filter(d => d.estado !== 'PAGADA').length

  const pagosFiltrados = pagos.filter(p => {
    const coincideTexto =
      p.idPago?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.idEstudiante?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.nombreEstudiante?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.concepto?.toLowerCase().includes(filtroTexto.toLowerCase())
    const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  const colorPago = (estado) => {
    if (estado === 'CONFIRMADO') return 'gp-badge-confirmado'
    if (estado === 'ANULADO') return 'gp-badge-anulado'
    return 'gp-badge-procesando'
  }

  return (
    <div className="gp-container">

      {/* NAVBAR */}
      <nav className="gp-navbar">
        <div className="gp-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="gp-logo-text">SIGA</span>
          <span className="gp-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="gp-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
          Cerrar sesión
        </button>
      </nav>

      <div className="gp-body">

        {/* SIDEBAR */}
        <SidebarAdmin />

        {/* MAIN */}
        <main className="gp-main">

          {mensaje && (
            <div className={`gp-alert ${tipoMensaje === 'error' ? 'gp-alert-error' : 'gp-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          {/* Stats */}
          <div className="gp-stats-grid">
            <div className="gp-stat-card verde">
              <div className="gp-stat-valor">S/ {totalCobrado.toFixed(2)}</div>
              <div className="gp-stat-label">Total cobrado</div>
            </div>
            <div className="gp-stat-card">
              <div className="gp-stat-valor">{pagos.filter(p => p.estado === 'CONFIRMADO').length}</div>
              <div className="gp-stat-label">Pagos confirmados</div>
            </div>
            <div className={`gp-stat-card ${deudasVencidas > 0 ? 'rojo' : ''}`}>
              <div className="gp-stat-valor">{deudasVencidas}</div>
              <div className="gp-stat-label">Deudas vencidas</div>
            </div>
            <div className="gp-stat-card">
              <div className="gp-stat-valor">{deudasPendientes}</div>
              <div className="gp-stat-label">Deudas pendientes</div>
            </div>
          </div>

          <div className="gp-header">
            <div>
              <h1 className="gp-title">Gestión de Pagos</h1>
              <p className="gp-subtitle">{pagos.length} pago(s) registrado(s) en el sistema</p>
            </div>
            <div className="gp-header-actions">
              <button className="gp-btn-sync" onClick={handleSincronizar}>
                Sincronizar estados
              </button>
              <button className="gp-btn-secondary" onClick={() => {
                setPlanForm(PLAN_INICIAL)
                setMostrarPlan(true)
              }}>
                Plan de pagos
              </button>
              <button className="gp-btn-primary" onClick={() => {
                setForm(FORM_INICIAL)
                setMostrarForm(true)
              }}>
                + Registrar pago
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="gp-filtros">
            <input
              className="gp-search"
              placeholder="Buscar por ID, estudiante o concepto..."
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
            />
            <div className="gp-chips">
              {['TODOS', 'CONFIRMADO', 'PROCESANDO', 'ANULADO'].map(est => (
                <button
                  key={est}
                  className={`gp-chip ${filtroEstado === est ? 'active' : ''} ${est !== 'TODOS' ? `chip-${est.toLowerCase()}` : ''}`}
                  onClick={() => setFiltroEstado(est)}>
                  {est}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-table-wrap">
            <table className="gp-table">
              <thead>
                <tr>
                  <th>ID Pago</th>
                  <th>Estudiante</th>
                  <th>Concepto</th>
                  <th>Deuda asociada</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.length === 0 ? (
                  <tr><td colSpan={8} className="gp-empty">No se encontraron pagos</td></tr>
                ) : (
                  pagosFiltrados.map(p => (
                    <tr key={p.idPago}>
                      <td>{p.idPago}</td>
                      <td>
                        <div className="gp-est-nombre">{p.nombreEstudiante}</div>
                        <div className="gp-est-id">{p.idEstudiante}</div>
                      </td>
                      <td>{p.concepto}</td>
                      <td><span className="gp-deuda-ref">{p.conceptoDeuda}</span></td>
                      <td><strong>S/ {parseFloat(p.monto).toFixed(2)}</strong></td>
                      <td>{p.fecha}</td>
                      <td><span className={`gp-badge ${colorPago(p.estado)}`}>{p.estado}</span></td>
                      <td>
                        {p.estado === 'CONFIRMADO' && (
                          <button className="gp-btn-anular" onClick={() => handleAnular(p.idPago)}>
                            Anular
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

      {/* MODAL REGISTRAR PAGO */}
      {mostrarForm && (
        <div className="gp-modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            <h2>Registrar nuevo pago</h2>
            <form onSubmit={handleRegistrar} className="gp-form">

              <div className="gp-row">
                <div className="gp-field">
                  <label>ID ESTUDIANTE</label>
                  <input value={form.idEstudiante}
                    onChange={e => setForm({...form, idEstudiante: e.target.value})}
                    placeholder="Ej: USR003" required maxLength={15} />
                </div>
                <div className="gp-field">
                  <label>ID DEUDA</label>
                  <select value={form.idDeuda}
                    onChange={e => {
                      const d = deudas.find(x => x.idDeuda === e.target.value)
                      setForm({
                        ...form,
                        idDeuda: e.target.value,
                        idEstudiante: d?.idEstudiante || form.idEstudiante,
                        concepto: d ? `Pago: ${d.concepto}` : form.concepto
                      })
                    }}>
                    <option value="">— Seleccionar deuda —</option>
                    {deudas.filter(d => d.estado !== 'PAGADA').map(d => (
                      <option key={d.idDeuda} value={d.idDeuda}>
                        {d.idDeuda} · {d.concepto} (S/ {parseFloat(d.monto).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gp-field">
                <label>CONCEPTO DEL PAGO</label>
                <input value={form.concepto}
                  onChange={e => setForm({...form, concepto: e.target.value})}
                  placeholder="Ej: Pago pensión Mayo 2026" required maxLength={150} />
              </div>

              <div className="gp-field">
                <label>MONTO (S/)</label>
                <input type="number" step="0.01" min="0.01" value={form.monto}
                  onChange={e => setForm({...form, monto: e.target.value})}
                  placeholder="0.00" required />
                {form.idDeuda && (() => {
                  const d = deudas.find(x => x.idDeuda === form.idDeuda)
                  return d ? (
                    <p className="gp-field-hint">
                      Deuda total: S/ {parseFloat(d.monto).toFixed(2)} ·
                      {parseFloat(form.monto || 0) >= parseFloat(d.monto)
                        ? ' ✓ Salda la deuda completamente'
                        : ' Pago parcial'}
                    </p>
                  ) : null
                })()}
              </div>

              <div className="gp-form-actions">
                <button type="submit" className="gp-btn-primary" disabled={cargando}>
                  {cargando ? 'Registrando...' : 'Confirmar pago'}
                </button>
                <button type="button" className="gp-btn-secondary"
                  onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PLAN DE PAGOS */}
      {mostrarPlan && (
        <div className="gp-modal-overlay" onClick={() => setMostrarPlan(false)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            <h2>Crear plan de pagos fraccionado</h2>
            <form onSubmit={handleCrearPlan} className="gp-form">

              <div className="gp-field">
                <label>DEUDA A FRACCIONAR</label>
                <select value={planForm.idDeuda}
                  onChange={e => setPlanForm({...planForm, idDeuda: e.target.value})}
                  required>
                  <option value="">— Seleccionar deuda —</option>
                  {deudas.filter(d => d.estado !== 'PAGADA').map(d => (
                    <option key={d.idDeuda} value={d.idDeuda}>
                      {d.idDeuda} · {d.concepto} (S/ {parseFloat(d.monto).toFixed(2)}) · {d.idEstudiante}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gp-row">
                <div className="gp-field">
                  <label>NÚMERO DE CUOTAS</label>
                  <input type="number" min="2" max="24" value={planForm.numeroCuotas}
                    onChange={e => setPlanForm({...planForm, numeroCuotas: e.target.value})}
                    required />
                </div>
                <div className="gp-field">
                  <label>FECHA DE INICIO</label>
                  <input type="date" value={planForm.fechaInicio}
                    onChange={e => setPlanForm({...planForm, fechaInicio: e.target.value})}
                    required />
                </div>
              </div>

              <p className="gp-aviso-plan">
                Al crear el plan, la restricción de matrícula activa para esta deuda será <strong>levantada temporalmente</strong> mientras el plan esté vigente.
              </p>

              <div className="gp-form-actions">
                <button type="submit" className="gp-btn-primary" disabled={cargando}>
                  {cargando ? 'Creando...' : 'Crear plan'}
                </button>
                <button type="button" className="gp-btn-secondary"
                  onClick={() => setMostrarPlan(false)}>
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

export default GestionPagos
