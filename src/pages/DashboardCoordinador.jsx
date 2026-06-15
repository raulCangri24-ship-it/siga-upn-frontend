import { useState, useEffect } from 'react'
import { BookOpen, Users, ClipboardList, CheckSquare } from 'lucide-react'
import { listarSecciones } from '../services/seccionService'
import PageShell from '../components/PageShell'

function DashboardCoordinador() {
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    listarSecciones()
      .then(r => setSecciones(r.data || []))
      .catch(() => setSecciones([]))
      .finally(() => setCargando(false))
  }, [])

  const totalSecciones = secciones.length
  const seccionesLlenas = secciones.filter(s => s.estado === 'LLENO').length
  const totalMatriculados = secciones.reduce((acc, s) => acc + (s.matriculados || 0), 0)
  const totalCupos = secciones.reduce((acc, s) => acc + (s.capacidadMaxima || 0), 0)

  const cards = [
    { label: 'Secciones activas', valor: totalSecciones, icon: BookOpen, color: '#3b82f6' },
    { label: 'Secciones llenas', valor: seccionesLlenas, icon: ClipboardList, color: '#ef4444' },
    { label: 'Estudiantes matriculados', valor: totalMatriculados, icon: Users, color: '#10b981' },
    { label: 'Cupos disponibles', valor: totalCupos - totalMatriculados, icon: CheckSquare, color: '#f59e0b' },
  ]

  return (
    <PageShell role="coordinador" navTitle="Dashboard Coordinador">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          Panel de Coordinación
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Periodo académico 2026-1 — Resumen general
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: c.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={18} color={c.color} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {cargando ? '—' : c.valor}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla resumen de secciones */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Secciones del periodo</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Curso', 'Docente', 'Aula', 'Horario', 'Cupos', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando...</td></tr>
              ) : secciones.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No hay secciones registradas</td></tr>
              ) : secciones.map(s => {
                const lleno = s.estado === 'LLENO'
                return (
                  <tr key={s.idSeccion} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-blue)' }}>{s.codigo}</td>
                    <td style={{ padding: '11px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>{s.curso}</td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.docente}</td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.aula}</td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.horario}</td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: '600', color: lleno ? 'var(--danger-text)' : 'var(--success-text)' }}>{s.matriculados}/{s.capacidadMaxima}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: lleno ? 'var(--danger-bg)' : 'var(--success-bg)', color: lleno ? 'var(--danger-text)' : 'var(--success-text)' }}>{s.estado}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}

export default DashboardCoordinador
