import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import '../styles/Auth.css';

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
      const response = await api.post('/auth/login', { correoUsr, passUsr });
      console.log('Login exitoso - Respuesta completa:', response.data);
      
      // Verificar qué campo contiene el token
      const token = response.data.jwt || response.data.token || response.data.access_token;
      
      if (!token) {
        setError('No se recibió token de autenticación. Verifica la respuesta del servidor.');
        console.error('Token no encontrado en respuesta:', response.data);
        return;
      }
      
      localStorage.setItem('token', token);
      console.log('Token guardado en localStorage:', token);
      alert('Sesión iniciada');
      
      // Pequeño delay para asegurar que el token esté guardado
      setTimeout(() => {
        navigate('/dashboard/tutor');
      }, 100);
    } catch (err: any) {
      console.error('Error en login:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Iniciar Sesión</h1>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={correoUsr}
            onChange={(e) => setCorreoUsr(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={passUsr}
            onChange={(e) => setPassUsr(e.target.value)}
            required
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
