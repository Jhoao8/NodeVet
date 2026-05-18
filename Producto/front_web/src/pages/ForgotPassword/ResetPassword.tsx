import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/ForgotPassword.css';
import Logo from '../../assets/images/Logo.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const resetCorreo = localStorage.getItem('resetCorreo');
      const resetCodigo = localStorage.getItem('resetCodigo');
      
      if (!resetCorreo || !resetCodigo) {
        setError('Faltan datos de recuperación. Por favor, solicita un nuevo código.');
        setLoading(false);
        return;
      }

      await api.post('/auth/reset-password', {
        correo_usr: resetCorreo,
        codigo: resetCodigo,
        nueva_pass: nuevaPassword,
      });
      
      localStorage.removeItem('resetCorreo');
      localStorage.removeItem('resetCodigo');
      alert('Contraseña restablecida exitosamente');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="forgot-password-box">
        <div className="auth-logo-container">
          <img src={Logo} alt="NodeVet Logo" className="auth-logo" />
          <h1>NodeVet</h1>
        </div>
        <h2>Establecer Nueva Contraseña</h2>
        <p className="info-text">
          Por favor, ingresa tu nueva contraseña dos veces para confirmarla.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              placeholder="Confirma tu nueva contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <button
          type="button"
          className="btn-link"
          onClick={() => navigate('/login')}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
