import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Grid, BookOpen, FileDown } from 'lucide-react'
import { getDashboardDocente } from '../services/dashboardService'
import PageShell from '../components/PageShell'
import PageHeader from '../components/ui/PageHeader'
import jsPDF from 'jspdf'

const PERIODOS = [
  { id: 'PER001', label: '2026-1' },
  { id: 'PER002', label: '2025-2' },
  { id: 'PER003', label: '2025-1' },
]

const cardVar = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) }

function BarraProgreso({ valor, color }) {
  return (
    <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(valor, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: '4px' }}
      />
    </div>
  )
}

function DashboardDocenteAdmin() {
  const [data, setData]               = useState(null)
  const [cargando, setCargando]       = useState(true)
  const [periodo, setPeriodo]         = useState('PER001')
  const [docenteId, setDocenteId]     = useState('')

  const cargar = (per) => {
    setCargando(true)
    getDashboardDocente(per)
      .then(r => { setData(r.data); setDocenteId('') })
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar(periodo) }, [periodo])

  const docentes     = data?.docentes || []
  const selDocente   = docenteId ? docentes.find(d => d.idDocente === docenteId) : null
  const sinInfo      = docenteId && !selDocente

  const pctColor = (p) => p >= 80 ? 'var(--success-text)' : p >= 50 ? 'var(--warning-text)' : 'var(--danger-text)'

  const exportarPDF = () => {
    if (!selDocente) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text('SIGA-UPN — Dashboard Docente', 15, 20)
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    doc.text(`Docente: ${selDocente.nombre}`, 15, 34)
    doc.text(`Periodo: ${data.periodo}`, 15, 42)
    doc.setDrawColor(200, 200, 200)
    doc.line(15, 47, 195, 47)
    doc.setFontSize(11)
    const items = [
      ['Secciones asignadas',       selDocente.seccionesAsignadas],
      ['Secciones con sílabo',      selDocente.seccionesConSilabo],
      ['Cumplimiento curricular',   `${selDocente.cumplimientoCurricular}%`],
      ['Estudiantes asignados',     selDocente.estudiantesAsignados],
      ['Asistencias registradas',   selDocente.asistenciasRegistradas],
      ['Notas registradas',         selDocente.notasRegistradas],
      ['Carga ejecutada',           `${selDocente.cargaEjecutada}%`],
    ]
    items.forEach(([label, val], i) => {
      const y = 58 + i * 10
      doc.setFont(undefined, 'bold')
      doc.text(`${label}:`, 15, y)
      doc.setFont(undefined, 'normal')
      doc.text(`${val}`, 100, y)
    })
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')} — SIGA-UPN`, 15, 165)
    doc.save(`docente_${selDocente.idDocente}_${data.periodo}.pdf`)
  }

  return (
    <PageShell role="admin" navTitle="Dashboard Docente">
      <PageHeader title="Dashboard Eficiencia Docente" subtitle="Indicadores de cumplimiento y carga académica por docente" />

      {/* Selectores */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Periodo</label>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
            {PERIODOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Docente</label>
          <select value={docenteId} onChange={e => setDocenteId(e.target.value)}
            disabled={cargando || docentes.length === 0}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', minWidth: '220px' }}>
            <option value="">— Seleccionar docente —</option>
            {docentes.map(d => <option key={d.idDocente} value={d.idDocente}>{d.nombre}</option>)}
          </select>
        </div>
        {selDocente && (
          <button onClick={exportarPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            <FileDown size={14} /> Exportar PDF
          </button>
        )}
      </div>

      {cargando && (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Cargando indicadores...</div>
      )}

      {!cargando && !data && (
        <div style={{ padding: '32px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', textAlign: 'center' }}>No se pudo cargar la información.</div>
      )}

      {/* Sin docente seleccionado — tabla resumen */}
      {!cargando && data && !docenteId && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Todos los docentes — {data.periodo}
          </h3>
          {docentes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px' }}>Sin información para este periodo</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Docente', 'Secciones', 'Con sílabo', 'Cumplimiento', 'Estudiantes', 'Carga'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docentes.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setDocenteId(d.idDocente)}>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{d.nombre}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.seccionesAsignadas}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.seccionesConSilabo}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: d.cumplimientoCurricular >= 80 ? 'var(--success-bg)' : 'var(--warning-bg)', color: pctColor(d.cumplimientoCurricular) }}>{d.cumplimientoCurricular}%</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.estudiantesAsignados}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: d.cargaEjecutada >= 80 ? 'var(--success-bg)' : 'var(--warning-bg)', color: pctColor(d.cargaEjecutada) }}>{d.cargaEjecutada}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}

      {/* Sin información para el docente/periodo */}
      {!cargando && sinInfo && (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>SIN INFORMACIÓN</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay datos para el docente y periodo seleccionados</div>
        </div>
      )}

      {/* Detalle del docente seleccionado */}
      {!cargando && selDocente && <>
        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { Icon: Grid,     label: 'Secciones asignadas', val: selDocente.seccionesAsignadas, color: 'var(--info-text)',    bg: 'var(--info-bg)' },
            { Icon: BookOpen, label: 'Cumplimiento curricular', val: `${selDocente.cumplimientoCurricular}%`, color: pctColor(selDocente.cumplimientoCurricular), bg: selDocente.cumplimientoCurricular >= 80 ? 'var(--success-bg)' : 'var(--warning-bg)' },
            { Icon: UserCheck,label: 'Carga ejecutada', val: `${selDocente.cargaEjecutada}%`, color: pctColor(selDocente.cargaEjecutada), bg: selDocente.cargaEjecutada >= 80 ? 'var(--success-bg)' : 'var(--warning-bg)' },
          ].map((k, i) => (
            <motion.div key={i} custom={i} variants={cardVar} initial="hidden" animate="visible"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: k.color, borderRadius: '14px 0 0 14px' }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <k.Icon size={18} color={k.color} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '6px' }}>{k.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Barras de progreso */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '24px' }}>
            {selDocente.nombre} — {data.periodo}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              { label: 'Cumplimiento curricular', val: selDocente.cumplimientoCurricular, color: pctColor(selDocente.cumplimientoCurricular) },
              { label: 'Carga ejecutada',         val: selDocente.cargaEjecutada,         color: pctColor(selDocente.cargaEjecutada) },
            ].map(ind => (
              <div key={ind.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{ind.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: ind.color }}>{ind.val}%</span>
                </div>
                <BarraProgreso valor={ind.val} color={ind.color} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Estudiantes asignados',   val: selDocente.estudiantesAsignados },
              { label: 'Asistencias registradas', val: selDocente.asistenciasRegistradas },
              { label: 'Notas registradas',        val: selDocente.notasRegistradas },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </>}
    </PageShell>
  )
}

export default DashboardDocenteAdmin
