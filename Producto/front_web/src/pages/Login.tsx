import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { getUserRole, getUserInfoFromToken } from '../utils/authUtils';
import '../styles/Auth.css';
import Logo from '../assets/images/Logo.png';

export default function Login() {
  const [correoUsr, setCorreoUsr] = useState('');
  const [passUsr, setPassUsr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== INICIO DE LOGIN ===');
      console.log('Email:', correoUsr);
      
      // 1. Enviar credenciales al servidor
      console.log('Enviando credenciales a /auth/login...');
      const response = await api.post('/auth/login', { 
        correoUsr, 
        passUsr,
        isMobile: false
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // 2. Extraer el token - El backend devuelve { token: "..." }
      const token = response.data.token;
      
      if (!token) {
        console.error('❌ Token no encontrado en la respuesta:', response.data);
        setError('No se recibió token del servidor. Respuesta: ' + JSON.stringify(response.data));
        setLoading(false);
        return;
      }
      
      console.log('✓ Token recibido correctamente');
      
      // 3. Guardar token en localStorage
      localStorage.setItem('token', token);
      console.log('✓ Token guardado en localStorage');
      
      // 4. Extraer información del token
      const userInfo = getUserInfoFromToken(token);
      if (userInfo?.username) {
        localStorage.setItem('username', userInfo.username);
        console.log('✓ Username guardado:', userInfo.username);
      }
      
      // 5. Obtener el rol basado en el email
      const role = await getUserRole(correoUsr);
      console.log('✓ Rol determinado:', role);
      localStorage.setItem('userRole', role);
      
      // 6. Redirigir al dashboard correspondiente
      console.log('Redirigiendo a:', role);
      setTimeout(() => {
        switch (role) {
          case 'ADMIN':
            navigate('/dashboard/admin');
            break;
          case 'VETERINARIO':
            navigate('/dashboard/medico');
            break;
          default:
            navigate('/dashboard/tutor');
        }
      }, 100);
      
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
      setError('Error al iniciar sesión: ' + errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo-container">
          <img src={Logo} alt="NodeVet Logo" className="auth-logo" />
          <h1>NodeVet</h1>
        </div>
        <h2>Iniciar Sesión</h2>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={correoUsr}
            onChange={(e) => setCorreoUsr(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={passUsr}
            onChange={(e) => setPassUsr(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p><Link to="/registro">¿No tienes cuenta? Regístrate</Link></p>
        <p><Link to="/recuperar/solicitud">¿Olvidaste tu contraseña?</Link></p>
        <p><Link to="/home">Volver al inicio</Link></p>
      </div>
    </div>
  );
}
