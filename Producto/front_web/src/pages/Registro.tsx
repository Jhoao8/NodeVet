import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import '../styles/Auth.css';
import Logo from '../assets/images/Logo.png';

export default function Registro() {
  const [formData, setFormData] = useState({
    nombreUsr: '',
    apellidoUsr: '',
    correoUsr: '',
    passUsr: '',
    confirmPassword: '',
    telefonoUsr: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.passUsr !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/v1/usuarios/registro', {
        nombreUsr: formData.nombreUsr,
        apellidoUsr: formData.apellidoUsr,
        correoUsr: formData.correoUsr,
        passUsr: formData.passUsr,
        telefonoUsr: formData.telefonoUsr
      });
      console.log('Registro exitoso:', response.data);
      alert('Usuario registrado exitosamente');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
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
        <h2>Crear Cuenta</h2>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombreUsr"
            placeholder="Nombre"
            value={formData.nombreUsr}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellidoUsr"
            placeholder="Apellido"
            value={formData.apellidoUsr}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="correoUsr"
            placeholder="Correo"
            value={formData.correoUsr}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telefonoUsr"
            placeholder="Teléfono (opcional)"
            value={formData.telefonoUsr}
            onChange={handleChange}
          />
          <input
            type="password"
            name="passUsr"
            placeholder="Contraseña"
            value={formData.passUsr}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <p><Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link></p>
        <p><Link to="/home">Volver al inicio</Link></p>
      </div>
    </div>
  );
}
