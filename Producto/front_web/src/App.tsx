import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Home from './pages/Home';
import RequestPassword from './pages/ForgotPassword/RequestPassword';
import ResetPassword from './pages/ForgotPassword/ResetPassword';
import SeleccionDia from './pages/AgendarCita/SeleccionDia';
import FormularioAgendarCita from './pages/AgendarCita/Formulario';
import DashboardTutor from './pages/Dashboard/DashboardTutor';
import DashboardMedico from './pages/Dashboard/DashboardMedico';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';
import AgregarMascota from './pages/AgregarMascota';
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
        
        {/* Dashboard Routes */}
        <Route path="/dashboard/tutor" element={<DashboardTutor />} />
        <Route path="/dashboard/medico" element={<DashboardMedico />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />

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
