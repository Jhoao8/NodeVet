import { useState } from 'react';
import api from '../api/client';
import '../styles/Auth.css';

export default function Login() {
  const [correoUsr, setCorreoUsr] = useState('');
  const [passUsr, setPassUsr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { correoUsr, passUsr });
      console.log('Login exitoso:', response.data);
      localStorage.setItem('token', response.data.jwt);
      alert('Sesión iniciada');
    } catch (err: any) {
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
        
        <p><a href="/registro">¿No tienes cuenta? Regístrate</a></p>
      </div>
    </div>
  );
}
