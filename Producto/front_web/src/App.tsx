import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Home from './pages/Home';
import RequestPassword from './pages/ForgotPassword/RequestPassword';
import ResetPassword from './pages/ForgotPassword/ResetPassword';
import SeleccionDia from './pages/AgendarCita/SeleccionDia';
import FormularioAgendarCita from './pages/AgendarCita/Formulario';
import PagoResultado from './pages/AgendarCita/PagoResultado';
import DashboardTutor from './pages/Dashboard/DashboardTutor';
import PerfilTutor from './pages/Perfil/PerfilTutor';
import DetalleMascota from './pages/Mascota/DetalleMascota';
import DashboardMedico from './pages/Dashboard/DashboardMedico';
import AtencionConsulta from './pages/Dashboard/AtencionConsulta';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';
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
        <Route path="/agendarCita" element={<SeleccionDia />} />
        <Route path="/agendarCita/formulario" element={<FormularioAgendarCita />} />
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
          path="/dashboard/medico"
          element={<ProtectedRoute element={<DashboardMedico />} requiredRole="VETERINARIO" />}
        />
        <Route
          path="/dashboard/medico/atencion"
          element={<ProtectedRoute element={<AtencionConsulta />} requiredRole="VETERINARIO" />}
        />
        <Route
          path="/dashboard/admin"
          element={<ProtectedRoute element={<DashboardAdmin />} requiredRole="ADMIN" />}
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
