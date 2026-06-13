import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: 'ADMIN' | 'VETERINARIO' | 'TUTOR';
}

export const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  // Leer directamente de localStorage para evitar problemas de sincronización
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log('ProtectedRoute - Token:', !!token, 'Rol:', userRole, 'Required:', requiredRole);

  // Si no está autenticado, redirigir a login
  if (!token) {
    console.warn('ProtectedRoute - No hay token, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Si requiere un rol específico y no lo tiene, redirigir a home
  if (requiredRole && userRole !== requiredRole) {
    console.warn('ProtectedRoute - Rol no coincide, redirigiendo a home');
    return <Navigate to="/home" replace />;
  }

  return element;
};
