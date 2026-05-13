import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import '../styles/Auth.css';

export default function AgregarMascota() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !tipo) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/v1/mascotas/registrar', {
        nomMascota: nombre,
        especie: tipo,
        raza: '',
        sexo: 1,
        peso: 0.0,
        estFecNac: 0
      });
      alert('Mascota agregada correctamente');
      navigate('/dashboard/tutor');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar la mascota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Agregar Mascota</h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de la mascota"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tipo de mascota"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Agregar Mascota'}
          </button>
        </form>

        <button type="button" className="btn-link" onClick={() => navigate('/dashboard/tutor')}>
          Volver al dashboard
        </button>
        <button type="button" className="btn-link" onClick={() => navigate('/home')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
