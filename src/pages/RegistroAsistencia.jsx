import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, BookOpen, Plus, ExternalLink, Trash2, Calendar, Monitor, Users } from 'lucide-react'
import { registrarAsistencia, listarAsistenciaPorFecha } from '../services/asistenciaService'
import { listarMateriales, publicarMaterial, eliminarMaterial } from '../services/asistenciaService'
import { obtenerSeccionesDocente, obtenerNotasSeccion } from '../services/evaluacionService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'

const ESTADOS = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO']

const ESTADO_CONFIG = {
  PRESENTE:    { bg: 'var(--success-bg)',  color: 'var(--success-text)',  label: 'Presente' },
  AUSENTE:     { bg: 'var(--danger-bg)',   color: 'var(--danger-text)',   label: 'Ausente' },
  TARDANZA:    { bg: 'var(--warning-bg)', color: 'var(--warning-text)',  label: 'Tardanza' },
  JUSTIFICADO: { bg: 'var(--info-bg)',    color: 'var(--info-text)',     label: 'Justificado' },
}

const TIPO_ICON = { VIDEO: '🎥', ENLACE: '🔗', PRESENTACION: '📊', DOCUMENTO: '📄' }

const TIPO_COLORS = {
  VIDEO:        { bg: 'rgba(239,68,68,0.12)',   color: '#F87171', border: 'rgba(239,68,68,0.2)' },
  ENLACE:       { bg: 'rgba(59,130,246,0.12)',  color: '#93C5FD', border: 'rgba(59,130,246,0.2)' },
  PRESENTACION: { bg: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: 'rgba(245,158,11,0.2)' },
  DOCUMENTO:    { bg: 'rgba(16,185,129,0.12)', color: '#34D399', border: 'rgba(16,185,129,0.2)' },
}

const MAX_FILE_MB = 10
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

function RegistroAsistencia() {
  const idDocente = localStorage.getItem('idUsuario')

  const [tab, setTab] = useState('asistencia')
  const [secciones, setSecciones] = useState([])
  const [idSeccionSel, setIdSeccionSel] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [modalidad, setModalidad] = useState('PRESENCIAL')
  const [registros, setRegistros] = useState([])
  const [materiales, setMateriales] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [formMaterial, setFormMaterial] = useState({ idMaterial: '', titulo: '', tipo: 'DOCUMENTO', url: '' })
  const [mostrarFormMaterial, setMostrarFormMaterial] = useState(false)
  const [archivoSel, setArchivoSel] = useState(null)

  useEffect(() => { cargarSecciones() }, [])
  useEffect(() => {
    if (idSeccionSel) { cargarAsistencia(); cargarMateriales() }
  }, [idSeccionSel, fecha])

  const cargarSecciones = async () => {
    try {
      const res = await obtenerSeccionesDocente(idDocente)
      setSecciones(res.data)
      if (res.data.length > 0) setIdSeccionSel(res.data[0].idSeccion)
    } catch { mostrarMsg('Error al cargar secciones', 'error') }
  }

  const cargarAsistencia = async () => {
    try {
      const res = await listarAsistenciaPorFecha(idSeccionSel, fecha)
      if (res.data.length > 0) {
        setRegistros(res.data.map(a => ({ idEstudiante: a.idEstudiante, nombreEstudiante: a.nombreEstudiante, estado: a.estado })))
      } else {
        const notasRes = await obtenerNotasSeccion(idSeccionSel)
        const estudiantes = (notasRes.data || []).map(r => ({ idEstudiante: r.idEstudiante, nombreEstudiante: r.nombreEstudiante, estado: 'PRESENTE' }))
        setRegistros(estudiantes)
      }
    } catch { mostrarMsg('Error al cargar asistencia', 'error') }
  }

  const cargarMateriales = async () => {
    try {
      const res = await listarMateriales(idSeccionSel)
      setMateriales(res.data)
    } catch { mostrarMsg('Error al cargar materiales', 'error') }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo); setTimeout(() => setMensaje(null), 4000)
  }

  const handleEstado = (idEstudiante, estado) => {
    setRegistros(prev => prev.map(r => r.idEstudiante === idEstudiante ? { ...r, estado } : r))
  }

  const handleGuardarAsistencia = async () => {
    setCargando(true)
    try {
      await registrarAsistencia({ idSeccion: idSeccionSel, idDocente, fecha, modalidad, registros: registros.map(r => ({ idEstudiante: r.idEstudiante, estado: r.estado })) })
      mostrarMsg('Asistencia registrada satisfactoriamente')
    } catch { mostrarMsg('Error al registrar asistencia', 'error') }
    finally { setCargando(false) }
  }

  const esArchivoTipo = (tipo) => tipo === 'DOCUMENTO' || tipo === 'PRESENTACION'

  const handleArchivoChange = (e) => {
    const file = e.target.files[0]
    if (!file) { setArchivoSel(null); return }
    setArchivoSel(file)
    setFormMaterial(prev => ({ ...prev, url: file.name }))
  }

  const handlePublicarMaterial = async (e) => {
    e.preventDefault()
    if (esArchivoTipo(formMaterial.tipo) && archivoSel) {
      if (archivoSel.size > MAX_FILE_BYTES) {
        mostrarMsg(`El archivo excede el tamaño máximo de ${MAX_FILE_MB}MB`, 'error')
        return
      }
    }
    try {
      await publicarMaterial({ ...formMaterial, idMaterial: `MAT${Date.now().toString().slice(-10)}`, idSeccion: idSeccionSel, idDocente })
      mostrarMsg('Material publicado correctamente')
      setFormMaterial({ idMaterial: '', titulo: '', tipo: 'DOCUMENTO', url: '' })
      setArchivoSel(null)
      setMostrarFormMaterial(false)
      cargarMateriales()
    } catch { mostrarMsg('Error al publicar material', 'error') }
  }

  const handleEliminarMaterial = async (id) => {
    if (!window.confirm('¿Eliminar este material?')) return
    try { await eliminarMaterial(id); mostrarMsg('Material eliminado'); cargarMateriales() }
    catch { mostrarMsg('Error al eliminar material', 'error') }
  }

  const fileSizePct = archivoSel ? Math.min((archivoSel.size / MAX_FILE_BYTES) * 100, 100) : 0
  const fileOverLimit = archivoSel && archivoSel.size > MAX_FILE_BYTES
  const fileSizeKB = archivoSel ? (archivoSel.size / 1024).toFixed(1) : 0

  return (
    <PageShell role="docente" navTitle="Asistencia y Materiales">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
            Portal Docente
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            Asistencia y Materiales
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Gestiona la asistencia y recursos del curso
          </p>
        </div>
        <select
          value={idSeccionSel}
          onChange={e => setIdSeccionSel(e.target.value)}
          style={{ minWidth: '220px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
        >
          {secciones.map(s => (
            <option key={s.idSeccion} value={s.idSeccion}>{s.codigo} — {s.idSeccion}</option>
          ))}
        </select>
      </motion.div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'asistencia', label: 'Registro de asistencia', Icon: CheckSquare },
          { id: 'materiales', label: `Materiales (${materiales.length})`, Icon: BookOpen },
        ].map(t => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none',
              background: tab === t.id ? 'var(--accent-blue)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            <t.Icon size={14} />{t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB ASISTENCIA */}
        {tab === 'asistencia' && (
          <motion.div
            key="asistencia"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>
                  <Calendar size={11} /> Fecha
                </label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '160px' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>
                  <Monitor size={11} /> Modalidad
                </label>
                <select value={modalidad} onChange={e => setModalidad(e.target.value)} style={{ width: '160px' }}>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <Users size={13} color="var(--text-secondary)" />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {registros.length} estudiantes
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {ESTADOS.map(e => {
                const count = registros.filter(r => r.estado === e).length
                const cfg = ESTADO_CONFIG[e]
                return (
                  <motion.div key={e} whileHover={{ scale: 1.03 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: '700', border: `1px solid ${cfg.color}30` }}>
                    <span style={{ fontSize: '16px', fontWeight: '800' }}>{count}</span>
                    {cfg.label}
                  </motion.div>
                )
              })}
            </div>

            {registros.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>👥</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Sin estudiantes matriculados en esta sección</div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', width: '50px' }}>#</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left' }}>Estudiante</th>
                      {ESTADOS.map(e => (
                        <th key={e} style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '700', color: ESTADO_CONFIG[e].color, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>
                          {ESTADO_CONFIG[e].label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r, i) => (
                      <motion.tr key={r.idEstudiante}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{i + 1}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                              {r.nombreEstudiante.charAt(0)}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{r.nombreEstudiante}</span>
                          </div>
                        </td>
                        {ESTADOS.map(estado => {
                          const cfg = ESTADO_CONFIG[estado]
                          const active = r.estado === estado
                          return (
                            <td key={estado} style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}
                                onClick={() => handleEstado(r.idEstudiante, estado)}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: active ? `2px solid ${cfg.color}` : '2px solid var(--border)', background: active ? cfg.bg : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', transition: 'all 0.15s' }}>
                                {active && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    style={{ width: '14px', height: '14px', borderRadius: '50%', background: cfg.color }} />
                                )}
                              </motion.button>
                            </td>
                          )
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <motion.button whileTap={{ scale: 0.97 }} whileHover={{ opacity: 0.9 }}
              onClick={handleGuardarAsistencia}
              disabled={cargando || registros.length === 0}
              style={{ padding: '11px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: cargando || registros.length === 0 ? 'not-allowed' : 'pointer', opacity: (cargando || registros.length === 0) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={14} />
              {cargando ? 'Guardando...' : 'Guardar asistencia'}
            </motion.button>
          </motion.div>
        )}

        {/* TAB MATERIALES */}
        {tab === 'materiales' && (
          <motion.div
            key="materiales"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  Recursos publicados
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  {materiales.length} recurso{materiales.length !== 1 ? 's' : ''} disponible{materiales.length !== 1 ? 's' : ''} para los estudiantes
                </p>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ opacity: 0.9 }}
                onClick={() => { setFormMaterial({ idMaterial: '', titulo: '', tipo: 'DOCUMENTO', url: '' }); setArchivoSel(null); setMostrarFormMaterial(true) }}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                <Plus size={14} /> Publicar material
              </motion.button>
            </div>

            {materiales.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '64px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>Sin materiales publicados</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Publica recursos para que tus estudiantes puedan acceder al material del curso</div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setFormMaterial({ idMaterial: '', titulo: '', tipo: 'DOCUMENTO', url: '' }); setArchivoSel(null); setMostrarFormMaterial(true) }}
                  style={{ padding: '9px 20px', borderRadius: '9px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  + Publicar primer material
                </motion.button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {materiales.map((m, i) => {
                  const tc = TIPO_COLORS[m.tipo] || TIPO_COLORS.DOCUMENTO
                  return (
                    <motion.div key={m.idMaterial}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)', position: 'relative' }}
                    >
                      <div style={{ height: '4px', position: 'relative', overflow: 'hidden', background: `linear-gradient(90deg, ${tc.color}40, ${tc.color}, ${tc.color}40)` }} />
                      <div style={{ padding: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                            {TIPO_ICON[m.tipo] || '📄'}
                          </div>
                          <div style={{ padding: '4px 10px', borderRadius: '20px', background: tc.bg, border: `1px solid ${tc.border}`, fontSize: '10px', fontWeight: '700', color: tc.color, letterSpacing: '0.5px' }}>
                            {m.tipo}
                          </div>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>{m.titulo}</h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={10} /> {m.fechaPublicacion}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {m.url && (
                            <a href={m.url} target="_blank" rel="noreferrer"
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color, fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>
                              <ExternalLink size={12} /> Ver recurso
                            </a>
                          )}
                          <motion.button whileTap={{ scale: 0.95 }}
                            onClick={() => handleEliminarMaterial(m.idMaterial)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '12px', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal material */}
      <Modal open={mostrarFormMaterial} onClose={() => { setMostrarFormMaterial(false); setArchivoSel(null) }} title="Publicar material" width="440px">
        <form onSubmit={handlePublicarMaterial}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Título</label>
            <input value={formMaterial.titulo} onChange={e => setFormMaterial({...formMaterial, titulo: e.target.value})} placeholder="Ej: Introducción al tema" required />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Tipo</label>
            <select value={formMaterial.tipo} onChange={e => { setFormMaterial({...formMaterial, tipo: e.target.value, url: ''}); setArchivoSel(null) }}>
              <option value="DOCUMENTO">Documento</option>
              <option value="PRESENTACION">Presentación</option>
              <option value="VIDEO">Video</option>
              <option value="ENLACE">Enlace</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {esArchivoTipo(formMaterial.tipo) ? 'ARCHIVO (máx. 10MB)' : 'URL'}
            </label>
            {esArchivoTipo(formMaterial.tipo) ? (
              <>
                <input type="file" onChange={handleArchivoChange}
                  accept={formMaterial.tipo === 'DOCUMENTO' ? '.pdf,.doc,.docx,.txt' : '.ppt,.pptx,.pdf'}
                  style={{ padding: '8px', cursor: 'pointer' }} />
                {archivoSel && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{archivoSel.name}</span>
                      <span style={{ color: fileOverLimit ? 'var(--danger-text)' : 'var(--success-text)', fontWeight: '700' }}>
                        {fileSizeKB} KB {fileOverLimit ? `(máx. ${MAX_FILE_MB}MB)` : '✓'}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${fileSizePct}%`, background: fileOverLimit ? 'var(--danger-text)' : 'var(--success-text)', borderRadius: '10px', transition: 'width 0.3s ease' }} />
                    </div>
                    {fileOverLimit && (
                      <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--danger-text)', fontWeight: '600' }}>
                        El archivo excede el límite de {MAX_FILE_MB}MB
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <input value={formMaterial.url} onChange={e => setFormMaterial({...formMaterial, url: e.target.value})} placeholder="https://..." />
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={esArchivoTipo(formMaterial.tipo) && fileOverLimit} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: (esArchivoTipo(formMaterial.tipo) && fileOverLimit) ? 'not-allowed' : 'pointer', opacity: (esArchivoTipo(formMaterial.tipo) && fileOverLimit) ? 0.5 : 1 }}>
              Publicar
            </button>
            <button type="button" onClick={() => { setMostrarFormMaterial(false); setArchivoSel(null) }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}

export default RegistroAsistencia
