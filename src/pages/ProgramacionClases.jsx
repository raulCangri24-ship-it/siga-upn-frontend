import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarSecciones, crearSeccion, editarSeccion, eliminarSeccion } from '../services/seccionService'
import { listarDocentes, listarAulas, listarCursos, listarPeriodos } from '../services/catalogoService'
import './ProgramacionClases.css'
import logoUpn from '../assets/logo-upn.png.png'
import SidebarAdmin from '../components/SidebarAdmin'

const FORM_INICIAL = {
  idSeccion: '', codigo: '', capacidadMaxima: 30,
  horario: '', idCurso: '', idDocente: '',
  idAula: '', idPeriodo: 'PER001'
}

function ProgramacionClases() {
  const navigate = useNavigate()
  const [secciones, setSecciones] = useState([])
  const [docentes, setDocentes] = useState([])
  const [aulas, setAulas] = useState([])
  const [cursos, setCursos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [modoEditar, setModoEditar] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('ok')
  const [cargando, setCargando] = useState(false)
  const [filtro, setFiltro] = useState('')

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      const [sec, doc, aul, cur, per] = await Promise.all([
        listarSecciones(),
        listarDocentes(),
        listarAulas(),
        listarCursos(),
        listarPeriodos()
      ])
      setSecciones(sec.data)
      setDocentes(doc.data.filter(u => u.rol === 'DOCENTE'))
      setAulas(aul.data)
      setCursos(cur.data)
      setPeriodos(per.data)
    } catch {
      mostrarMensaje('Error al cargar datos', 'error')
    }
  }

  const mostrarMensaje = (texto, tipo = 'ok') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      if (modoEditar) {
        await editarSeccion(form.idSeccion, form)
        mostrarMensaje('Programación actualizada satisfactoriamente')
      } else {
        await crearSeccion(form)
        mostrarMensaje('Programación registrada satisfactoriamente')
      }
      setMostrarForm(false)
      setForm(FORM_INICIAL)
      cargarTodo()
    } catch (err) {
      mostrarMensaje(err.response?.data || 'Error al guardar', 'error')
    } finally {
      setCargando(false)
    }
  }

  const handleEditar = (s) => {
    setForm({
      idSeccion: s.idSeccion,
      codigo: s.codigo,
      capacidadMaxima: s.capacidadMaxima,
      horario: s.horario,
      idCurso: cursos.find(c => c.nombre === s.curso)?.idCurso || '',
      idDocente: docentes.find(d =>
        `${d.nombre} ${d.apellido}` === s.docente)?.idUsuario || '',
      idAula: aulas.find(a => a.codigo === s.aula)?.idAula || '',
      idPeriodo: periodos.find(p => p.nombre === s.periodo)?.idPeriodo || 'PER001'
    })
    setModoEditar(true)
    setMostrarForm(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sección?')) return
    try {
      await eliminarSeccion(id)
      mostrarMensaje('Sección eliminada satisfactoriamente')
      cargarTodo()
    } catch {
      mostrarMensaje('Error al eliminar', 'error')
    }
  }

  const seccionesFiltradas = secciones.filter(s =>
    s.curso?.toLowerCase().includes(filtro.toLowerCase()) ||
    s.docente?.toLowerCase().includes(filtro.toLowerCase()) ||
    s.codigo?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="pc-container">

      {/* NAVBAR */}
      <nav className="pc-navbar">
        <div className="pc-navbar-left">
          <img src={logoUpn} alt="UPN" style={{ height: "36px", objectFit: "contain" }} />
          <span className="pc-logo-text">SIGA</span>
          <span className="pc-logo-sub">Sistema Integrado de Gestión Académica · UPN</span>
        </div>
        <button className="pc-logout" onClick={() => {
          localStorage.clear()
          navigate('/login')
        }}>Cerrar sesión</button>
      </nav>

      <div className="pc-body">

        {/* SIDEBAR */}
        <SidebarAdmin />

        {/* MAIN */}
        <main className="pc-main">

          {mensaje && (
            <div className={`pc-alert ${tipoMensaje === 'error' ? 'pc-alert-error' : 'pc-alert-ok'}`}>
              {mensaje}
            </div>
          )}

          <div className="pc-header">
            <div>
              <h1 className="pc-title">Programación de Clases</h1>
              <p className="pc-subtitle">Periodo 2026-1 · {secciones.length} secciones registradas</p>
            </div>
            <button className="pc-btn-primary" onClick={() => {
              setForm(FORM_INICIAL)
              setModoEditar(false)
              setMostrarForm(true)
            }}>+ Nueva sección</button>
          </div>

          {/* Buscador */}
          <div className="pc-filtros">
            <input
              className="pc-search"
              placeholder="Buscar por curso, docente o código..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
          </div>

          {/* Tabla */}
          <div className="pc-table-wrap">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Curso</th>
                  <th>Docente</th>
                  <th>Aula</th>
                  <th>Horario</th>
                  <th>Cupos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {seccionesFiltradas.length === 0 ? (
                  <tr><td colSpan={8} className="pc-empty">No hay secciones registradas</td></tr>
                ) : (
                  seccionesFiltradas.map(s => (
                    <tr key={s.idSeccion}>
                      <td><strong>{s.codigo}</strong></td>
                      <td>{s.curso}</td>
                      <td>{s.docente}</td>
                      <td>{s.aula}</td>
                      <td>{s.horario}</td>
                      <td>
                        <span className={s.matriculados >= s.capacidadMaxima ? 'pc-cupo-lleno' : 'pc-cupo-ok'}>
                          {s.matriculados}/{s.capacidadMaxima}
                        </span>
                      </td>
                      <td>
                        <span className={`pc-badge ${s.estado === 'LLENO' ? 'badge-lleno' : 'badge-disponible'}`}>
                          {s.estado}
                        </span>
                      </td>
                      <td className="pc-acciones">
                        <button className="pc-btn-edit" onClick={() => handleEditar(s)}>Editar</button>
                        <button className="pc-btn-delete" onClick={() => handleEliminar(s.idSeccion)}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* MODAL */}
      {mostrarForm && (
        <div className="pc-modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="pc-modal" onClick={e => e.stopPropagation()}>
            <h2>{modoEditar ? 'Editar sección' : 'Nueva sección'}</h2>
            <form onSubmit={handleGuardar} className="pc-form">

              <div className="pc-row">
                {!modoEditar && (
                  <div className="pc-field">
                    <label>ID SECCIÓN</label>
                    <input value={form.idSeccion}
                      onChange={e => setForm({...form, idSeccion: e.target.value})}
                      placeholder="Ej: SEC001" required />
                  </div>
                )}
                <div className="pc-field">
                  <label>CÓDIGO</label>
                  <input value={form.codigo}
                    onChange={e => setForm({...form, codigo: e.target.value})}
                    placeholder="Ej: IS201-A" required />
                </div>
              </div>

              <div className="pc-field">
                <label>CURSO</label>
                <select value={form.idCurso}
                  onChange={e => setForm({...form, idCurso: e.target.value})} required>
                  <option value="">Seleccionar curso...</option>
                  {cursos.map(c => (
                    <option key={c.idCurso} value={c.idCurso}>
                      {c.nombre} — {c.creditos} créditos — Ciclo {c.ciclo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pc-field">
                <label>DOCENTE</label>
                <select value={form.idDocente}
                  onChange={e => setForm({...form, idDocente: e.target.value})} required>
                  <option value="">Seleccionar docente...</option>
                  {docentes.map(d => (
                    <option key={d.idUsuario} value={d.idUsuario}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pc-row">
                <div className="pc-field">
                  <label>AULA</label>
                  <select value={form.idAula}
                    onChange={e => setForm({...form, idAula: e.target.value})}>
                    <option value="">Sin aula asignada</option>
                    {aulas.map(a => (
                      <option key={a.idAula} value={a.idAula}>
                        {a.codigo} — {a.tipo} — Aforo: {a.aforo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pc-field">
                  <label>CAPACIDAD MÁXIMA</label>
                  <input type="number" min="1" max="100"
                    value={form.capacidadMaxima}
                    onChange={e => setForm({...form, capacidadMaxima: parseInt(e.target.value)})}
                    required />
                </div>
              </div>

              <div className="pc-field">
                <label>HORARIO</label>
                <input value={form.horario}
                  onChange={e => setForm({...form, horario: e.target.value})}
                  placeholder="Ej: Lun-Mie 08:00-10:00" required />
              </div>

              <div className="pc-field">
                <label>PERIODO ACADÉMICO</label>
                <select value={form.idPeriodo}
                  onChange={e => setForm({...form, idPeriodo: e.target.value})} required>
                  {periodos.map(p => (
                    <option key={p.idPeriodo} value={p.idPeriodo}>
                      {p.nombre} — {p.estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pc-form-actions">
                <button type="submit" className="pc-btn-primary" disabled={cargando}>
                  {cargando ? 'Guardando...' : (modoEditar ? 'Actualizar' : 'Registrar')}
                </button>
                <button type="button" className="pc-btn-secondary"
                  onClick={() => setMostrarForm(false)}>Cancelar</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProgramacionClases