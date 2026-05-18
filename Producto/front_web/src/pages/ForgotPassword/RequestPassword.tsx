import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/ForgotPassword.css';
import Logo from '../../assets/images/Logo.png';

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
    
    const emailToSubmit = correo.trim();
    if (!emailToSubmit) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/forgot-password', { correo_usr: emailToSubmit });
      setSuccess('Se ha enviado un código de verificación a tu correo');
      setCodigoEnviado(true);
      setCorreo(emailToSubmit);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeToSubmit = codigo.trim();
    const emailToSubmit = correo.trim();

    if (!codeToSubmit || codeToSubmit.length !== 6 || !/^\d+$/.test(codeToSubmit)) {
      setError('El código debe contener 6 dígitos numéricos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-code', {
        correo_usr: emailToSubmit,
        codigo: codeToSubmit,
      });
      localStorage.setItem('resetCorreo', emailToSubmit);
      localStorage.setItem('resetCodigo', codeToSubmit);
      setCodigo(codeToSubmit);
      navigate('/recuperar/restablecer');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/forgot-password', { correo_usr: correo.trim() });
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
        <div className="auth-logo-container">
          <img src={Logo} alt="NodeVet Logo" className="auth-logo" />
          <h1>NodeVet</h1>
        </div>
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
