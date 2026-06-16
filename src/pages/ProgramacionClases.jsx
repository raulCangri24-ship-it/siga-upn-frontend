import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { listarSecciones, crearSeccion, editarSeccion, eliminarSeccion } from '../services/seccionService'
import { listarDocentes, listarAulas, listarCursos, listarPeriodos } from '../services/catalogoService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

const DIAS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']

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
  const [diasSel, setDiasSel] = useState([])
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFin, setHoraFin] = useState('10:00')
  const [modoEditar, setModoEditar] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [modalError, setModalError] = useState(null)

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

  const nextSeccionId = (secs) => {
    const nums = secs.map(s => parseInt(s.idSeccion?.replace('SEC', '')) || 0).filter(n => n > 0)
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
    return `SEC${String(next).padStart(3, '0')}`
  }

  const nextCodigo = (idCurso, secs, curs) => {
    const cursoNombre = curs.find(c => c.idCurso === idCurso)?.nombre || ''
    const existing = secs.filter(s => s.curso === cursoNombre)
    const letra = String.fromCharCode(65 + existing.length)
    const prefix = idCurso.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 6)
    return `${prefix}${letra}`
  }

  const parseHorario = (horario) => {
    if (!horario) return { dias: [], inicio: '08:00', fin: '10:00' }
    const parts = horario.trim().split(' ')
    const dias = (parts[0] || '').split('-').filter(d => DIAS.includes(d))
    const horas = (parts[1] || '').split('-')
    return { dias, inicio: horas[0] || '08:00', fin: horas[1] || '10:00' }
  }

  const handleNuevaSeccion = () => {
    const newId = nextSeccionId(secciones)
    setForm({ ...FORM_INICIAL, idSeccion: newId })
    setDiasSel([])
    setHoraInicio('08:00')
    setHoraFin('10:00')
    setModoEditar(false)
    setModalError(null)
    setMostrarForm(true)
  }

  const handleCursoChange = (idCurso) => {
    const nuevoCodigo = idCurso ? nextCodigo(idCurso, secciones, cursos) : ''
    setForm(prev => ({ ...prev, idCurso, codigo: nuevoCodigo }))
  }

  const toggleDia = (dia) => {
    setDiasSel(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (diasSel.length === 0) { setModalError('Selecciona al menos un día para el horario'); return }
    const horarioBuilt = `${diasSel.join('-')} ${horaInicio}-${horaFin}`
    setCargando(true); setModalError(null)
    try {
      const payload = { ...form, horario: horarioBuilt }
      if (modoEditar) { await editarSeccion(form.idSeccion, payload); mostrarMsg('Programación actualizada') }
      else { await crearSeccion(payload); mostrarMsg('Programación registrada satisfactoriamente') }
      setMostrarForm(false); setForm(FORM_INICIAL); setDiasSel([]); cargarTodo()
    } catch (err) { setModalError(err.response?.data || 'Error al guardar') }
    finally { setCargando(false) }
  }

  const handleEditar = (s) => {
    const { dias, inicio, fin } = parseHorario(s.horario)
    setDiasSel(dias)
    setHoraInicio(inicio)
    setHoraFin(fin)
    setForm({
      idSeccion: s.idSeccion, codigo: s.codigo, capacidadMaxima: s.capacidadMaxima,
      horario: s.horario,
      idCurso: cursos.find(c => c.nombre === s.curso)?.idCurso || '',
      idDocente: docentes.find(d => `${d.nombre} ${d.apellido}` === s.docente)?.idUsuario || '',
      idAula: aulas.find(a => a.codigo === s.aula)?.idAula || '',
      idPeriodo: periodos.find(p => p.nombre === s.periodo)?.idPeriodo || 'PER001'
    })
    setModoEditar(true); setModalError(null); setMostrarForm(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sección?')) return
    try { await eliminarSeccion(id); mostrarMsg('Sección eliminada'); cargarTodo() }
    catch { mostrarMsg('Error al eliminar', 'error') }
  }

  const seccionesFiltradas = secciones.filter(s =>
    `${s.curso} ${s.docente} ${s.codigo}`.toLowerCase().includes(filtro.toLowerCase())
  )

  const horarioPreview = diasSel.length > 0 ? `${diasSel.join('-')} ${horaInicio}-${horaFin}` : '—'

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
        <button onClick={handleNuevaSeccion}
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
      <Modal open={mostrarForm} onClose={() => { setMostrarForm(false); setModalError(null) }} title={modoEditar ? 'Editar sección' : 'Nueva sección'} width="560px">
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {field('ID SECCIÓN', <input value={form.idSeccion} readOnly={!modoEditar} style={!modoEditar ? { background: 'var(--bg-elevated)', cursor: 'default', opacity: 0.8, fontFamily: 'monospace' } : {}} onChange={e => setForm({...form, idSeccion: e.target.value})} />)}
            {field('CÓDIGO', <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="Ej: IS201-A" required />)}
          </div>
          {field('CURSO',
            <select value={form.idCurso} onChange={e => handleCursoChange(e.target.value)} required>
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

          {/* Horario con selectores */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>HORARIO</label>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Días</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {DIAS.map(dia => {
                  const sel = diasSel.includes(dia)
                  return (
                    <button key={dia} type="button" onClick={() => toggleDia(dia)}
                      style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1px solid', background: sel ? 'var(--accent-blue)' : 'transparent', borderColor: sel ? 'var(--accent-blue)' : 'var(--border)', color: sel ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                      {dia}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hora inicio</div>
                <select value={horaInicio} onChange={e => setHoraInicio(e.target.value)}>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hora fin</div>
                <select value={horaFin} onChange={e => setHoraFin(e.target.value)}>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '12px', color: diasSel.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: diasSel.length > 0 ? '700' : '400' }}>
              Vista previa: {horarioPreview}
            </div>
          </div>

          {field('PERIODO ACADÉMICO',
            <select value={form.idPeriodo} onChange={e => setForm({...form, idPeriodo: e.target.value})} required>
              {periodos.map(p => <option key={p.idPeriodo} value={p.idPeriodo}>{p.nombre} — {p.estado}</option>)}
            </select>
          )}

          {modalError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: '12px', fontWeight: '600', marginBottom: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              {modalError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {cargando ? 'Guardando...' : (modoEditar ? 'Actualizar' : 'Registrar')}
            </button>
            <button type="button" onClick={() => { setMostrarForm(false); setModalError(null) }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}

export default ProgramacionClases
