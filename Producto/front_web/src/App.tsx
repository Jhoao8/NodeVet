import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Home from './pages/Home';
import RequestPassword from './pages/ForgotPassword/RequestPassword';
import ResetPassword from './pages/ForgotPassword/ResetPassword';
import AgendarHora from './pages/AgendarCita/AgendarHora';
import PagoResultado from './pages/AgendarCita/PagoResultado';
import DashboardTutor from './pages/Dashboard/DashboardTutor';
import PerfilTutor from './pages/Perfil/PerfilTutor';
import PerfilVeterinario from './pages/Perfil/PerfilVeterinario';
import DetalleMascota from './pages/Mascota/DetalleMascota';
import EditarMascota from './pages/Mascota/EditarMascota';
import DashboardMedico from './pages/Dashboard/DashboardMedico';
import AtencionConsulta from './pages/Dashboard/AtencionConsulta';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';
import GestionVeterinarios from './pages/Dashboard/GestionVeterinarios';
import DetalleVeterinario from './pages/Dashboard/DetalleVeterinario';
import GenerarAgenda from './pages/Dashboard/GenerarAgenda';
import ConfigPrecio from './pages/Dashboard/ConfigPrecio';
import AgregarMascota from './pages/AgregarMascota';
import { ProtectedRoute } from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar/solicitud" element={<RequestPassword />} />
        <Route path="/recuperar/restablecer" element={<ResetPassword />} />
        
        {/* Home */}
        <Route path="/home" element={<Home />} />
        
        {/* Agendar Cita Routes */}
        <Route path="/agendarCita" element={<AgendarHora />} />
        {/* Ruta antigua del flujo en dos pasos: ahora todo vive en /agendarCita */}
        <Route path="/agendarCita/formulario" element={<Navigate to="/agendarCita" replace />} />
        <Route path="/pago/resultado" element={<PagoResultado />} />
        
        {/* Dashboard Routes - Protegidas por Rol */}
        <Route
          path="/dashboard/tutor"
          element={<DashboardTutor />}
        />
        <Route
          path="/dashboard/tutor/perfil"
          element={<PerfilTutor />}
        />
        <Route
          path="/dashboard/tutor/mascota/:id"
          element={<DetalleMascota />}
        />
        <Route
          path="/dashboard/tutor/mascota/:id/editar"
          element={<EditarMascota />}
        />
        {/* La lista de citas vive ahora en el dashboard (espejo del Home móvil) */}
        <Route
          path="/dashboard/tutor/citas"
          element={<Navigate to="/dashboard/tutor" replace />}
        />
        <Route
          path="/dashboard/medico"
          element={<ProtectedRoute element={<DashboardMedico />} requiredRole="VETERINARIO" />}
        />
        <Route
          path="/dashboard/medico/atencion"
          element={<ProtectedRoute element={<AtencionConsulta />} requiredRole="VETERINARIO" />}
        />
        <Route
          path="/dashboard/medico/perfil"
          element={<ProtectedRoute element={<PerfilVeterinario />} requiredRole="VETERINARIO" />}
        />
        <Route
          path="/dashboard/admin"
          element={<ProtectedRoute element={<DashboardAdmin />} requiredRole="ADMIN" />}
        />
        <Route
          path="/dashboard/admin/veterinarios"
          element={<ProtectedRoute element={<GestionVeterinarios />} requiredRole="ADMIN" />}
        />
        <Route
          path="/dashboard/admin/veterinarios/:id"
          element={<ProtectedRoute element={<DetalleVeterinario />} requiredRole="ADMIN" />}
        />
        <Route
          path="/dashboard/admin/agenda"
          element={<ProtectedRoute element={<GenerarAgenda />} requiredRole="ADMIN" />}
        />
        <Route
          path="/dashboard/admin/precio"
          element={<ProtectedRoute element={<ConfigPrecio />} requiredRole="ADMIN" />}
        />

        {/* Mascotas */}
        <Route path="/agregar-mascota" element={<AgregarMascota />} />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
