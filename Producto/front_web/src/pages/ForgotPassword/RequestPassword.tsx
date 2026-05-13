import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/ForgotPassword.css';

export default function RequestPassword() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/forgot-password', { correoUsr: correo });
      setSuccess('Se ha enviado un código de verificación a tu correo');
      setCodigoEnviado(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-code', {
        correoUsr: correo,
        codigo,
      });
      localStorage.setItem('resetToken', response.data.token);
      navigate('/recuperar/restablecer');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { correoUsr: correo });
      setSuccess('Código reenviado a tu correo');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="forgot-password-box">
        <h2>Recuperar Contraseña</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={codigoEnviado ? handleVerifyCode : handleSendCode}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="Ingrese su correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={codigoEnviado}
            />
          </div>

          {codigoEnviado && (
            <div className="form-group">
              <label>Código de Verificación</label>
              <input
                type="text"
                placeholder="Ingrese el código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
              <p className="info-text">Se le enviará un código de verificación al correo ingresado</p>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Procesando...' : codigoEnviado ? 'Enviar' : 'Enviar Código'}
          </button>
        </form>

        {codigoEnviado && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResendCode}
            disabled={loading}
          >
            Reenviar
          </button>
        )}

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
