import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { listarSecciones, crearSeccion, editarSeccion, eliminarSeccion } from '../services/seccionService'
import { listarDocentes, listarAulas, listarCursos, listarPeriodos } from '../services/catalogoService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

const FORM_INICIAL = {
  idSeccion: '', codigo: '', capacidadMaxima: 30,
  horario: '', idCurso: '', idDocente: '', idAula: '', idPeriodo: 'PER001'
}

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.025, duration: 0.25 } }),
}

function ProgramacionClases() {
  const rolActual = localStorage.getItem('rol')?.toLowerCase() || 'admin'
  const [secciones, setSecciones] = useState([])
  const [docentes, setDocentes] = useState([])
  const [aulas, setAulas] = useState([])
  const [cursos, setCursos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [modoEditar, setModoEditar] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [filtro, setFiltro] = useState('')

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      const [sec, doc, aul, cur, per] = await Promise.all([
        listarSecciones(), listarDocentes(), listarAulas(), listarCursos(), listarPeriodos()
      ])
      setSecciones(sec.data)
      setDocentes(doc.data.filter(u => u.rol === 'DOCENTE'))
      setAulas(aul.data); setCursos(cur.data); setPeriodos(per.data)
    } catch { mostrarMsg('Error al cargar datos', 'error') }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const handleGuardar = async (e) => {
    e.preventDefault(); setCargando(true)
    try {
      if (modoEditar) { await editarSeccion(form.idSeccion, form); mostrarMsg('Programación actualizada') }
      else { await crearSeccion(form); mostrarMsg('Programación registrada satisfactoriamente') }
      setMostrarForm(false); setForm(FORM_INICIAL); cargarTodo()
    } catch (err) { mostrarMsg(err.response?.data || 'Error al guardar', 'error') }
    finally { setCargando(false) }
  }

  const handleEditar = (s) => {
    setForm({
      idSeccion: s.idSeccion, codigo: s.codigo, capacidadMaxima: s.capacidadMaxima,
      horario: s.horario,
      idCurso: cursos.find(c => c.nombre === s.curso)?.idCurso || '',
      idDocente: docentes.find(d => `${d.nombre} ${d.apellido}` === s.docente)?.idUsuario || '',
      idAula: aulas.find(a => a.codigo === s.aula)?.idAula || '',
      idPeriodo: periodos.find(p => p.nombre === s.periodo)?.idPeriodo || 'PER001'
    })
    setModoEditar(true); setMostrarForm(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sección?')) return
    try { await eliminarSeccion(id); mostrarMsg('Sección eliminada'); cargarTodo() }
    catch { mostrarMsg('Error al eliminar', 'error') }
  }

  const seccionesFiltradas = secciones.filter(s =>
    `${s.curso} ${s.docente} ${s.codigo}`.toLowerCase().includes(filtro.toLowerCase())
  )

  const field = (label, input) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
      {input}
    </div>
  )

  return (
    <PageShell role={rolActual} navTitle="Programación de Clases">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader title="Programación de Clases" subtitle={`Periodo 2026-1 · ${secciones.length} secciones registradas`}>
        <button onClick={() => { setForm(FORM_INICIAL); setModoEditar(false); setMostrarForm(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={13} /> Nueva sección
        </button>
      </PageHeader>

      {/* Buscador */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input placeholder="Buscar por curso, docente o código..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ paddingLeft: '34px' }} />
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Curso', 'Docente', 'Aula', 'Horario', 'Cupos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seccionesFiltradas.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No hay secciones registradas</td></tr>
              ) : seccionesFiltradas.map((s, i) => {
                const pct = Math.round((s.matriculados / s.capacidadMaxima) * 100)
                const lleno = s.matriculados >= s.capacidadMaxima
                return (
                  <motion.tr key={s.idSeccion} custom={i} variants={rowVar} initial="hidden" animate="visible"
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-blue)' }}>{s.codigo}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', maxWidth: '180px' }}>{s.curso}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.docente}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.aula}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.horario}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: lleno ? 'var(--danger-text)' : 'var(--success-text)', marginBottom: '4px' }}>{s.matriculados}/{s.capacidadMaxima}</div>
                      <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', width: '60px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: lleno ? 'var(--danger-text)' : 'var(--accent-blue)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: lleno ? 'var(--danger-bg)' : 'var(--success-bg)', color: lleno ? 'var(--danger-text)' : 'var(--success-text)' }}>{s.estado}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEditar(s)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', background: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          <Edit2 size={12} /> Editar
                        </button>
                        <button onClick={() => handleEliminar(s.idSeccion)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={mostrarForm} onClose={() => setMostrarForm(false)} title={modoEditar ? 'Editar sección' : 'Nueva sección'} width="540px">
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {!modoEditar && <div>{field('ID SECCIÓN', <input value={form.idSeccion} onChange={e => setForm({...form, idSeccion: e.target.value})} placeholder="Ej: SEC001" required />)}</div>}
            <div style={{ gridColumn: modoEditar ? '1 / -1' : 'auto' }}>{field('CÓDIGO', <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="Ej: IS201-A" required />)}</div>
          </div>
          {field('CURSO',
            <select value={form.idCurso} onChange={e => setForm({...form, idCurso: e.target.value})} required>
              <option value="">Seleccionar curso...</option>
              {cursos.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombre} — {c.creditos} créditos — Ciclo {c.ciclo}</option>)}
            </select>
          )}
          {field('DOCENTE',
            <select value={form.idDocente} onChange={e => setForm({...form, idDocente: e.target.value})} required>
              <option value="">Seleccionar docente...</option>
              {docentes.map(d => <option key={d.idUsuario} value={d.idUsuario}>{d.nombre} {d.apellido}</option>)}
            </select>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('AULA',
              <select value={form.idAula} onChange={e => setForm({...form, idAula: e.target.value})}>
                <option value="">Sin aula asignada</option>
                {aulas.map(a => <option key={a.idAula} value={a.idAula}>{a.codigo} — {a.tipo} — Aforo: {a.aforo}</option>)}
              </select>
            )}</div>
            <div>{field('CAPACIDAD MÁXIMA', <input type="number" min="1" max="100" value={form.capacidadMaxima} onChange={e => setForm({...form, capacidadMaxima: parseInt(e.target.value)})} required />)}</div>
          </div>
          {field('HORARIO', <input value={form.horario} onChange={e => setForm({...form, horario: e.target.value})} placeholder="Ej: Lun-Mie 08:00-10:00" required />)}
          {field('PERIODO ACADÉMICO',
            <select value={form.idPeriodo} onChange={e => setForm({...form, idPeriodo: e.target.value})} required>
              {periodos.map(p => <option key={p.idPeriodo} value={p.idPeriodo}>{p.nombre} — {p.estado}</option>)}
            </select>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {cargando ? 'Guardando...' : (modoEditar ? 'Actualizar' : 'Registrar')}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}

export default ProgramacionClases
