import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarActas, generarActa, cerrarActa } from '../services/actaService'
import { obtenerSeccionesDocente } from '../services/evaluacionService'
import './GestionActas.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarDocente from '../components/SidebarDocente'

function GestionActas() {
  const navigate = useNavigate()
  const idDocente = localStorage.getItem('idUsuario')
  const nombre = localStorage.getItem('nombre')

  const [actas, setActas] = useState([])
  const [secciones, setSecciones] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [idSeccionForm, setIdSeccionForm] = useState('')
  const [confirmCerrar, setConfirmCerrar] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  useEffect(() => {
    cargar()
    obtenerSeccionesDocente(idDocente)
      .then(r => {
        setSecciones(r.data || [])
        if (r.data?.length > 0) setIdSeccionForm(r.data[0].idSeccion)
      })
      .catch(() => {})
  }, [idDocente])

  const cargar = async () => {
    try {
      const res = await listarActas()
      setActas(res.data || [])
    } catch {
      mostrarMsg('Error al cargar actas', 'error')
    }
  }

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleGenerar = async (e) => {
    e.preventDefault()
    if (!idSeccionForm) return
    setCargando(true)
    try {
      await generarActa(idSeccionForm, idDocente)
      mostrarMsg('Acta generada satisfactoriamente en estado BORRADOR')
      setMostrarForm(false)
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al generar acta', 'error')
    } finally {
      setCargando(false)
    }
  }

  const handleCerrar = async () => {
    if (!confirmCerrar) return
    setCargando(true)
    try {
      await cerrarActa(confirmCerrar.idActa)
      mostrarMsg('Acta firmada — historial académico actualizado')
      setConfirmCerrar(null)
      cargar()
    } catch (err) {
      mostrarMsg(err.response?.data || 'Error al cerrar acta', 'error')
    } finally {
      setCargando(false)
    }
  }

  const actasFiltradas = actas.filter(a =>
    filtroEstado === 'TODOS' || a.estado === filtroEstado)

  const menuItems = [
    { label: 'Inicio',       ruta: '/dashboard/docente' },
    { label: 'Evaluaciones', ruta: '/docente/evaluaciones' },
    { label: 'Actas',        ruta: '/docente/actas' },
    { label: 'Asistencia',   ruta: null },
  ]

  return (
    <div className="ga-container">

      {/* NAVBAR */}
      <nav className="ga-navbar">
        <div className="ga-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="ga-logo-text">SIGA</span>
          <span className="ga-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <div className="ga-navbar-right">
          <span className="ga-user">👤 {nombre}</span>
          <button className="ga-logout" onClick={() => { localStorage.clear(); navigate('/login') }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="ga-body">

        {/* SIDEBAR */}
        <SidebarDocente className="ga-sidebar">
          {menuItems.map((item, i) => (
            <div key={item.label}
              className={`ga-menu-item ${i === 2 ? 'active' : ''}`}
              onClick={() => item.ruta && navigate(item.ruta)}>
              {item.label}
            </div>
          ))}
        </SidebarDocente>

        {/* MAIN */}
        <main className="ga-main">

          {mensaje && (
            <div className={`ga-alert ${tipoMensaje === 'error' ? 'ga-alert-error' : 'ga-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="ga-header">
            <div>
              <h1 className="ga-title">Gestión de Actas</h1>
              <p className="ga-subtitle">
                {actas.length} acta(s) · {actas.filter(a => a.estado === 'FIRMADA').length} firmada(s)
              </p>
            </div>
            <button className="ga-btn-primary" onClick={() => setMostrarForm(true)}>
              + Generar acta
            </button>
          </div>

          {/* Filtros */}
          <div className="ga-filtros">
            {['TODOS', 'BORRADOR', 'FIRMADA'].map(est => (
              <button
                key={est}
                className={`ga-chip ${filtroEstado === est ? 'active' : ''} ${est !== 'TODOS' ? `chip-${est.toLowerCase()}` : ''}`}
                onClick={() => setFiltroEstado(est)}>
                {est}
              </button>
            ))}
          </div>

          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead>
                <tr>
                  <th>ID Acta</th>
                  <th>Sección</th>
                  <th>Docente</th>
                  <th>Generación</th>
                  <th>Estado</th>
                  <th>Fecha firma</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {actasFiltradas.length === 0 ? (
                  <tr><td colSpan={7} className="ga-empty">No hay actas registradas</td></tr>
                ) : (
                  actasFiltradas.map(a => (
                    <tr key={a.idActa}>
                      <td>{a.idActa}</td>
                      <td>{a.idSeccion}</td>
                      <td>{a.idDocente}</td>
                      <td>{a.fechaGeneracion}</td>
                      <td>
                        <span className={`ga-badge ${a.estado === 'FIRMADA' ? 'ga-badge-firmada' : 'ga-badge-borrador'}`}>
                          {a.estado}
                        </span>
                      </td>
                      <td>{a.fechaFirma || '—'}</td>
                      <td>
                        {a.estado === 'BORRADOR' && (
                          <button className="ga-btn-cerrar"
                            onClick={() => setConfirmCerrar(a)}>
                            Firmar acta
                          </button>
                        )}
                        {a.estado === 'FIRMADA' && (
                          <span className="ga-firmada-text">Cerrada</span>
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

      {/* MODAL GENERAR ACTA */}
      {mostrarForm && (
        <div className="ga-modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="ga-modal" onClick={e => e.stopPropagation()}>
            <h2>Generar nueva acta</h2>
            <form onSubmit={handleGenerar} className="ga-form">
              <div className="ga-field">
                <label>SECCIÓN</label>
                {secciones.length > 0 ? (
                  <select value={idSeccionForm}
                    onChange={e => setIdSeccionForm(e.target.value)}>
                    {secciones.map(s => (
                      <option key={s.idSeccion} value={s.idSeccion}>
                        {s.idSeccion} — {s.codigo}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input value={idSeccionForm}
                    onChange={e => setIdSeccionForm(e.target.value)}
                    placeholder="Ej: SEC001" required />
                )}
              </div>
              <p className="ga-aviso-form">
                Se generará un acta en estado <strong>BORRADOR</strong>. Una vez firmada, no podrá modificarse y se actualizará el historial académico.
              </p>
              <div className="ga-form-actions">
                <button type="submit" className="ga-btn-primary" disabled={cargando}>
                  {cargando ? 'Generando...' : 'Generar acta'}
                </button>
                <button type="button" className="ga-btn-secondary"
                  onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CIERRE */}
      {confirmCerrar && (
        <div className="ga-modal-overlay" onClick={() => setConfirmCerrar(null)}>
          <div className="ga-modal ga-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="ga-confirm-icon">⚠️</div>
            <h2>Confirmar firma de acta</h2>
            <p className="ga-confirm-text">
              Está a punto de <strong>firmar y cerrar</strong> el acta <strong>{confirmCerrar.idActa}</strong> de la sección <strong>{confirmCerrar.idSeccion}</strong>.
            </p>
            <p className="ga-confirm-warning">
              Esta acción es <strong>irreversible</strong>. Se actualizará automáticamente el historial académico de todos los estudiantes matriculados.
            </p>
            <div className="ga-form-actions">
              <button className="ga-btn-firmar" disabled={cargando} onClick={handleCerrar}>
                {cargando ? 'Procesando...' : 'Confirmar firma'}
              </button>
              <button className="ga-btn-secondary" onClick={() => setConfirmCerrar(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GestionActas
