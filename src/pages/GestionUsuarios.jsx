import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Upload, Edit2, ToggleLeft, Lock, Search } from 'lucide-react'
import {
  listarUsuarios, crearUsuario, editarUsuario,
  cambiarEstado, cargarCsv
} from '../services/usuarioService'
import PageShell from '../components/PageShell'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

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

const BADGE = {
  ACTIVO:   { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  INACTIVO: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
  BLOQUEADO:{ bg: 'var(--danger-bg)',  color: 'var(--danger-text)'  },
}

const ROL_BADGE = {
  ADMIN:        { bg: 'var(--danger-bg)',   color: 'var(--danger-text)'  },
  DOCENTE:      { bg: 'var(--info-bg)',     color: 'var(--info-text)'    },
  ESTUDIANTE:   { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  COORDINADOR:  { bg: 'var(--purple-bg)',  color: 'var(--purple-text)'  },
  RECTOR:       { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
}

const rowVar = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
}

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [filtro, setFiltro] = useState('')
  const [filtroRol, setFiltroRol] = useState('TODOS')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [modoEditar, setModoEditar] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState(null)
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(false)
  const [csvResultados, setCsvResultados] = useState([])
  const [mostrarCsv, setMostrarCsv] = useState(false)
  const [modalError, setModalError] = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await listarUsuarios()
      setUsuarios(res.data)
    } catch { mostrarMsg('Error al cargar usuarios', 'error') }
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje(texto); setTipoMensaje(tipo)
    setTimeout(() => setMensaje(null), 4000)
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const t = `${u.nombre} ${u.correo} ${u.idUsuario}`.toLowerCase()
    return t.includes(filtro.toLowerCase()) &&
      (filtroRol === 'TODOS' || u.rol === filtroRol)
  })

  const abrirNuevoUsuario = () => {
    const nums = usuarios.map(u => parseInt(u.idUsuario?.replace('USR', '')) || 0).filter(n => n > 0)
    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1
    const nuevoId = `USR${String(nextNum).padStart(3, '0')}`
    setForm({ ...FORM_INICIAL, idUsuario: nuevoId })
    setModoEditar(false)
    setModalError(null)
    setMostrarForm(true)
  }

  const handleGuardar = async (e) => {
    e.preventDefault(); setCargando(true); setModalError(null)
    try {
      if (modoEditar) {
        await editarUsuario(form.idUsuario, form)
        mostrarMsg('Usuario actualizado satisfactoriamente')
      } else {
        await crearUsuario(form)
        mostrarMsg('Usuario registrado satisfactoriamente')
      }
      setMostrarForm(false); setForm(FORM_INICIAL); cargar()
    } catch (err) {
      setModalError(err.response?.data || 'Error al guardar usuario')
    } finally { setCargando(false) }
  }

  const handleEditar = (u) => {
    setForm({
      idUsuario: u.idUsuario, nombre: u.nombre, apellido: u.apellido,
      correo: u.correo, contrasena: '',
      idRol: ROLES.find(r => r.nombre === u.rol)?.id || 'ROL002'
    })
    setModoEditar(true); setModalError(null); setMostrarForm(true)
  }

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevo = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try {
      await cambiarEstado(id, nuevo)
      mostrarMsg(`Usuario ${nuevo === 'ACTIVO' ? 'activado' : 'desactivado'} satisfactoriamente`)
      cargar()
    } catch { mostrarMsg('Error al cambiar estado', 'error') }
  }

  const handleBloquear = async (id) => {
    try {
      await cambiarEstado(id, 'BLOQUEADO')
      mostrarMsg('Cuenta bloqueada satisfactoriamente')
      cargar()
    } catch { mostrarMsg('Error al bloquear usuario', 'error') }
  }

  const handleCsv = async (e) => {
    const file = e.target.files[0]; if (!file) return
    try {
      const res = await cargarCsv(file)
      setCsvResultados(res.data); setMostrarCsv(true); cargar()
    } catch { mostrarMsg('Error al procesar el archivo CSV', 'error') }
  }

  const chip = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      cursor: 'pointer', border: '1px solid',
      background: active ? 'var(--accent-blue)' : 'transparent',
      borderColor: active ? 'var(--accent-blue)' : 'var(--border-input)',
      color: active ? '#fff' : 'var(--text-secondary)',
      transition: 'all 0.15s',
    }}>{label}</button>
  )

  const btn = (label, onClick, variant = 'ghost', Icon, disabled) => {
    const styles = {
      primary: { background: 'var(--accent-blue)', color: '#fff', border: 'none' },
      secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
      danger: { background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)' },
      warning: { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid rgba(245,158,11,0.2)' },
    }
    return (
      <button onClick={onClick} disabled={disabled} style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '7px 13px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s', ...styles[variant],
      }}>
        {Icon && <Icon size={13} />}{label}
      </button>
    )
  }

  const field = (label, input) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
      {input}
    </div>
  )

  return (
    <PageShell role="admin" navTitle="Gestión de Usuarios">
      <Alert message={mensaje} variant={tipoMensaje} onClose={() => setMensaje(null)} />

      <PageHeader
        title="Gestión de Usuarios"
        subtitle={`${usuarios.length} usuarios registrados en el sistema`}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <Upload size={13} /> Cargar CSV
          <input type="file" accept=".csv" onChange={handleCsv} hidden />
        </label>
        {btn('Nuevo usuario', abrirNuevoUsuario, 'primary', Plus)}
      </PageHeader>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            placeholder="Buscar por nombre, correo o ID..."
            value={filtro} onChange={e => setFiltro(e.target.value)}
            style={{ paddingLeft: '34px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['TODOS', 'ADMIN', 'DOCENTE', 'ESTUDIANTE', 'COORDINADOR'].map(r =>
            chip(r, filtroRol === r, () => setFiltroRol(r))
          )}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Nombre completo', 'Correo', 'Rol', 'Estado', 'Fecha creación', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No se encontraron usuarios</td></tr>
              ) : (
                usuariosFiltrados.map((u, i) => {
                  const badgeEstado = BADGE[u.estado] || BADGE.INACTIVO
                  const badgeRol = ROL_BADGE[u.rol] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)' }
                  return (
                    <motion.tr key={u.idUsuario} custom={i} variants={rowVar} initial="hidden" animate="visible"
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.idUsuario}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.nombre} {u.apellido}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{u.correo}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badgeRol.bg, color: badgeRol.color }}>{u.rol}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: badgeEstado.bg, color: badgeEstado.color }}>{u.estado}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>{u.fechaCreacion}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          {btn('Editar', () => handleEditar(u), 'secondary', Edit2)}
                          {btn(u.estado === 'ACTIVO' ? 'Desactivar' : 'Activar', () => handleCambiarEstado(u.idUsuario, u.estado), 'warning', ToggleLeft)}
                          {u.estado !== 'BLOQUEADO' && btn('Bloquear', () => handleBloquear(u.idUsuario), 'danger', Lock)}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      <Modal open={mostrarForm} onClose={() => { setMostrarForm(false); setModalError(null) }} title={modoEditar ? 'Editar usuario' : 'Nuevo usuario'}>
        <form onSubmit={handleGuardar}>
          {!modoEditar && field('ID USUARIO',
            <input value={form.idUsuario} readOnly style={{ background: 'var(--bg-elevated)', cursor: 'default', opacity: 0.8 }} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('NOMBRE', <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre" required />)}</div>
            <div>{field('APELLIDO', <input value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} placeholder="Apellido" required />)}</div>
          </div>
          {!modoEditar && field('CORREO INSTITUCIONAL',
            <input type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} placeholder="usuario@upn.edu.pe" required />
          )}
          {field(modoEditar ? 'NUEVA CONTRASEÑA (opcional)' : 'CONTRASEÑA',
            <input type="password" value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} placeholder="••••••••" required={!modoEditar} />
          )}
          {field('ROL',
            <select value={form.idRol} onChange={e => setForm({...form, idRol: e.target.value})}>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          )}
          {modalError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: '12px', fontWeight: '600', marginBottom: '14px', border: '1px solid rgba(239,68,68,0.2)' }}>
              {modalError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={cargando} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Guardando...' : (modoEditar ? 'Actualizar' : 'Registrar')}
            </button>
            <button type="button" onClick={() => { setMostrarForm(false); setModalError(null) }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px' }}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal CSV */}
      <Modal open={mostrarCsv} onClose={() => setMostrarCsv(false)} title="Resultados de carga CSV">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
          {csvResultados.map((r, i) => (
            <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', background: r.includes('OK') ? 'var(--success-bg)' : 'var(--danger-bg)', color: r.includes('OK') ? 'var(--success-text)' : 'var(--danger-text)' }}>
              {r}
            </div>
          ))}
        </div>
        <button onClick={() => setMostrarCsv(false)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
          Cerrar
        </button>
      </Modal>
    </PageShell>
  )
}

export default GestionUsuarios
