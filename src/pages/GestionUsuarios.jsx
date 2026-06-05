import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listarUsuarios, crearUsuario, editarUsuario,
  cambiarEstado, cargarCsv
} from '../services/usuarioService'
import './GestionUsuarios.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarAdmin from '../components/SidebarAdmin'

const ROLES = [
  { id: 'ROL001', nombre: 'ADMIN' },
  { id: 'ROL002', nombre: 'ESTUDIANTE' },
  { id: 'ROL003', nombre: 'DOCENTE' },
  { id: 'ROL004', nombre: 'COORDINADOR' },
  { id: 'ROL005', nombre: 'RECTOR' },
]

const FORM_INICIAL = {
  idUsuario: '', nombre: '', apellido: '',
  correo: '', contrasena: '', idRol: 'ROL002'
}

function GestionUsuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [filtro, setFiltro] = useState('')
  const [filtroRol, setFiltroRol] = useState('TODOS')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [modoEditar, setModoEditar] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)
  const [csvResultados, setCsvResultados] = useState([])
  const [mostrarCsv, setMostrarCsv] = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarUsuarios()
      setUsuarios(res.data)
    } catch {
      mostrarMensaje('Error al cargar usuarios', 'error')
    }
  }

  const mostrarMensaje = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideTexto =
      u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      u.correo.toLowerCase().includes(filtro.toLowerCase()) ||
      u.idUsuario.toLowerCase().includes(filtro.toLowerCase())
    const coincideRol = filtroRol === 'TODOS' || u.rol === filtroRol
    return coincideTexto && coincideRol
  })

  const handleGuardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      if (modoEditar) {
        await editarUsuario(form.idUsuario, form)
        mostrarMensaje('Usuario actualizado satisfactoriamente')
      } else {
        await crearUsuario(form)
        mostrarMensaje('Usuario registrado satisfactoriamente')
      }
      setMostrarForm(false)
      setForm(FORM_INICIAL)
      cargar()
    } catch (err) {
      mostrarMensaje(err.response?.data || 'Error al guardar usuario', 'error')
    } finally {
      setCargando(false)
    }
  }

  const handleEditar = (u) => {
    setForm({
      idUsuario: u.idUsuario,
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      contrasena: '',
      idRol: ROLES.find(r => r.nombre === u.rol)?.id || 'ROL002'
    })
    setModoEditar(true)
    setMostrarForm(true)
  }

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try {
      await cambiarEstado(id, nuevoEstado)
      mostrarMensaje(`Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} satisfactoriamente`)
      cargar()
    } catch {
      mostrarMensaje('Error al cambiar estado', 'error')
    }
  }

  const handleBloquear = async (id) => {
    try {
      await cambiarEstado(id, 'BLOQUEADO')
      mostrarMensaje('Cuenta bloqueada satisfactoriamente')
      cargar()
    } catch {
      mostrarMensaje('Error al bloquear usuario', 'error')
    }
  }

  const handleCsv = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const res = await cargarCsv(file)
      setCsvResultados(res.data)
      setMostrarCsv(true)
      cargar()
    } catch {
      mostrarMensaje('Error al procesar el archivo CSV', 'error')
    }
  }

  const colorEstado = (estado) => {
    if (estado === 'ACTIVO') return 'badge-activo'
    if (estado === 'BLOQUEADO') return 'badge-bloqueado'
    return 'badge-inactivo'
  }

  return (
    <div className="gu-container">

      {/* NAVBAR */}
      <nav className="gu-navbar">
        <div className="gu-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="gu-logo-text">SIGA</span>
          <span className="gu-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="gu-logout" onClick={() => {
          localStorage.clear()
          navigate('/login')
        }}>
          Cerrar sesión
        </button>
      </nav>

      <div className="gu-body">

        {/* SIDEBAR */}
        <SidebarAdmin />

        {/* MAIN */}
        <main className="gu-main">

          {mensaje && (
            <div className={`gu-alert ${tipoMensaje === 'error' ? 'gu-alert-error' : 'gu-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="gu-header">
            <div>
              <h1 className="gu-title">Gestión de Usuarios</h1>
              <p className="gu-subtitle">{usuarios.length} usuarios registrados en el sistema</p>
            </div>
            <div className="gu-header-actions">
              <label className="gu-btn-secondary">
                Cargar CSV
                <input type="file" accept=".csv" onChange={handleCsv} hidden />
              </label>
              <button className="gu-btn-primary" onClick={() => {
                setForm(FORM_INICIAL)
                setModoEditar(false)
                setMostrarForm(true)
              }}>
                + Nuevo usuario
              </button>
            </div>
          </div>

          <div className="gu-filtros">
            <input
              className="gu-search"
              placeholder="Buscar por nombre, correo o ID..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
            <div className="gu-chips">
              {['TODOS', 'ADMIN', 'DOCENTE', 'ESTUDIANTE', 'COORDINADOR'].map(r => (
                <button
                  key={r}
                  className={`gu-chip ${filtroRol === r ? 'active' : ''}`}
                  onClick={() => setFiltroRol(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="gu-table-wrap">
            <table className="gu-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} className="gu-empty">No se encontraron usuarios</td></tr>
                ) : (
                  usuariosFiltrados.map(u => (
                    <tr key={u.idUsuario}>
                      <td>{u.idUsuario}</td>
                      <td>{u.nombre} {u.apellido}</td>
                      <td>{u.correo}</td>
                      <td>{u.rol}</td>
                      <td><span className={`gu-badge ${colorEstado(u.estado)}`}>{u.estado}</span></td>
                      <td>{u.fechaCreacion}</td>
                      <td className="gu-acciones">
                        <button className="gu-btn-edit" onClick={() => handleEditar(u)}>Editar</button>
                        <button className="gu-btn-toggle"
                          onClick={() => handleCambiarEstado(u.idUsuario, u.estado)}>
                          {u.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                        </button>
                        {u.estado !== 'BLOQUEADO' && (
                          <button className="gu-btn-block" onClick={() => handleBloquear(u.idUsuario)}>
                            Bloquear
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
        <div className="gu-modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="gu-modal" onClick={e => e.stopPropagation()}>
            <h2>{modoEditar ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <form onSubmit={handleGuardar} className="gu-form">

              {!modoEditar && (
                <div className="gu-field">
                  <label>ID USUARIO</label>
                  <input value={form.idUsuario}
                    onChange={e => setForm({...form, idUsuario: e.target.value})}
                    placeholder="Ej: USR010" required />
                </div>
              )}

              <div className="gu-row">
                <div className="gu-field">
                  <label>NOMBRE</label>
                  <input value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                    placeholder="Nombre" required />
                </div>
                <div className="gu-field">
                  <label>APELLIDO</label>
                  <input value={form.apellido}
                    onChange={e => setForm({...form, apellido: e.target.value})}
                    placeholder="Apellido" required />
                </div>
              </div>

              {!modoEditar && (
                <div className="gu-field">
                  <label>CORREO INSTITUCIONAL</label>
                  <input type="email" value={form.correo}
                    onChange={e => setForm({...form, correo: e.target.value})}
                    placeholder="usuario@upn.edu.pe" required />
                </div>
              )}

              <div className="gu-field">
                <label>{modoEditar ? 'NUEVA CONTRASEÑA (opcional)' : 'CONTRASEÑA'}</label>
                <input type="password" value={form.contrasena}
                  onChange={e => setForm({...form, contrasena: e.target.value})}
                  placeholder="••••••••"
                  required={!modoEditar} />
              </div>

              <div className="gu-field">
                <label>ROL</label>
                <select value={form.idRol}
                  onChange={e => setForm({...form, idRol: e.target.value})}>
                  {ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="gu-form-actions">
                <button type="submit" className="gu-btn-primary" disabled={cargando}>
                  {cargando ? 'Guardando...' : (modoEditar ? 'Actualizar' : 'Registrar')}
                </button>
                <button type="button" className="gu-btn-secondary"
                  onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CSV */}
      {mostrarCsv && (
        <div className="gu-modal-overlay" onClick={() => setMostrarCsv(false)}>
          <div className="gu-modal" onClick={e => e.stopPropagation()}>
            <h2>Resultados de carga CSV</h2>
            <div className="gu-csv-results">
              {csvResultados.map((r, i) => (
                <div key={i} className={`gu-csv-row ${r.includes('OK') ? 'ok' : 'error'}`}>
                  {r}
                </div>
              ))}
            </div>
            <button className="gu-btn-primary" onClick={() => setMostrarCsv(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default GestionUsuarios