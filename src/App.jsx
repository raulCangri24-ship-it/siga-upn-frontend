import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardEstudiante from './pages/DashboardEstudiante'
import DashboardDocente from './pages/DashboardDocente'
import RutaProtegida from './components/RutaProtegida'
import GestionUsuarios from './pages/GestionUsuarios'
import ProgramacionClases from './pages/ProgramacionClases'
import PortalMatricula from './pages/PortalMatricula'
import RestriccionDeuda from './pages/RestriccionDeuda'
import GestionDeudas from './pages/GestionDeudas'
import RegistroEvaluaciones from './pages/RegistroEvaluaciones'
import MisNotas from './pages/MisNotas'
import GestionActas from './pages/GestionActas'
import RegistroAsistencia from './pages/RegistroAsistencia'
import MisPagos from './pages/MisPagos'
import GestionPagos from './pages/GestionPagos'
import MisAccesos from './pages/MisAccesos'
import Horarios from './pages/Horarios'
import DashboardEstudiantil from './pages/DashboardEstudiantil'
import DashboardDocenteAdmin from './pages/DashboardDocenteAdmin'
import DashboardRector from './pages/DashboardRector'
import MisCursos from './pages/MisCursos'
import DashboardUnificado from './pages/DashboardUnificado'
import DashboardCoordinador from './pages/DashboardCoordinador'
import ProgramacionCoordinador from './pages/coordinador/ProgramacionCoordinador'
import ActasCoordinador from './pages/coordinador/ActasCoordinador'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard/admin" element={
        <RutaProtegida rolRequerido="ADMIN">
          <DashboardAdmin />
        </RutaProtegida>
      } />

      <Route path="/dashboard/estudiante" element={
        <RutaProtegida rolRequerido="ESTUDIANTE">
          <DashboardEstudiante />
        </RutaProtegida>
      } />

      <Route path="/dashboard/docente" element={
        <RutaProtegida rolRequerido="DOCENTE">
          <DashboardDocente />
        </RutaProtegida>
      } />

      <Route path="/admin/usuarios" element={
        <RutaProtegida rolRequerido="ADMIN">
          <GestionUsuarios />
        </RutaProtegida>
      } />

      <Route path="/admin/programacion" element={
        <RutaProtegida rolRequerido={["ADMIN", "COORDINADOR"]}>
          <ProgramacionClases />
        </RutaProtegida>
      } />

      <Route path="/estudiante/matricula" element={
       <RutaProtegida rolRequerido="ESTUDIANTE">
         <PortalMatricula />
       </RutaProtegida>
      } />

      <Route path="/estudiante/restriccion" element={
        <RutaProtegida rolRequerido="ESTUDIANTE">
          <RestriccionDeuda />
        </RutaProtegida>
      } />

      <Route path="/admin/deudas" element={
        <RutaProtegida rolRequerido="ADMIN">
          <GestionDeudas />
        </RutaProtegida>
      } />

      <Route path="/estudiante/notas" element={
        <RutaProtegida rolRequerido="ESTUDIANTE">
          <MisNotas />
        </RutaProtegida>
      } />

      <Route path="/docente/evaluaciones" element={
        <RutaProtegida rolRequerido="DOCENTE">
          <RegistroEvaluaciones />
        </RutaProtegida>
      } />

      <Route path="/docente/actas" element={
        <RutaProtegida rolRequerido={["DOCENTE", "COORDINADOR"]}>
          <GestionActas />
        </RutaProtegida>
      } />

      <Route path="/docente/asistencia" element={
        <RutaProtegida rolRequerido="DOCENTE">
          <RegistroAsistencia />
        </RutaProtegida>
      } />

      <Route path="/estudiante/pagos" element={
        <RutaProtegida rolRequerido="ESTUDIANTE">
          <MisPagos />
        </RutaProtegida>
      } />

      <Route path="/admin/pagos" element={
        <RutaProtegida rolRequerido="ADMIN">
          <GestionPagos />
        </RutaProtegida>
      } />

      <Route path="/estudiante/accesos" element={
        <RutaProtegida rolRequerido="ESTUDIANTE">
          <MisAccesos />
        </RutaProtegida>
      } />

      <Route path="/estudiante/horarios" element={
        <RutaProtegida rolRequerido="ESTUDIANTE">
          <Horarios />
        </RutaProtegida>
      } />

      <Route path="/admin/dashboard/estudiantil" element={
        <RutaProtegida rolRequerido={["ADMIN", "RECTOR"]}>
          <DashboardEstudiantil />
        </RutaProtegida>
      } />

      <Route path="/admin/dashboard/docente" element={
        <RutaProtegida rolRequerido="ADMIN">
          <DashboardDocenteAdmin />
        </RutaProtegida>
      } />

      <Route path="/admin/dashboard/rector" element={
        <RutaProtegida rolRequerido="RECTOR">
          <DashboardRector />
        </RutaProtegida>
      } />

      <Route path="/rector/dashboard" element={
        <RutaProtegida rolRequerido="RECTOR">
          <DashboardRector />
        </RutaProtegida>
      } />

      <Route path="/docente/cursos" element={
        <RutaProtegida rolRequerido="DOCENTE">
          <MisCursos />
        </RutaProtegida>
      } />

      <Route path="/admin/dashboard" element={
        <RutaProtegida rolRequerido="ADMIN">
          <DashboardUnificado />
        </RutaProtegida>
      } />

      <Route path="/coordinador/dashboard" element={
        <RutaProtegida rolRequerido="COORDINADOR">
          <DashboardCoordinador />
        </RutaProtegida>
      } />

      <Route path="/coordinador/programacion" element={
        <RutaProtegida rolRequerido="COORDINADOR">
          <ProgramacionCoordinador />
        </RutaProtegida>
      } />

      <Route path="/coordinador/actas" element={
        <RutaProtegida rolRequerido="COORDINADOR">
          <ActasCoordinador />
        </RutaProtegida>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App