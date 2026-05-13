import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/AgendarCita.css';

interface Mascota {
  idMascota: number;
  nomMascota: string;
}

export default function FormularioAgendarCita() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [medico, setMedico] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Pet data
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');
  const [nombreMascota, setNombreMascota] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState('');
  const [edadAproximada, setEdadAproximada] = useState('');
  const [peso, setPeso] = useState('');

  useEffect(() => {
    // Cargar mascotas del usuario
    const fetchMascotas = async () => {
      try {
        const response = await api.get('/v1/mascotas/listar');
        setMascotas(response.data);
      } catch (err) {
        console.error('Error al cargar mascotas:', err);
      }
    };

    fetchMascotas();
  }, []);

  const handleMascotaSeleccionada = (mascotaId: string) => {
    setMascotaSeleccionada(mascotaId);
    const mascota = mascotas.find((m) => m.idMascota.toString() === mascotaId);
    if (mascota) {
      setNombreMascota(mascota.nomMascota);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const citaSeleccionada = JSON.parse(localStorage.getItem('citaSeleccionada') || '{}');

      const nuevaCita = {
        nombreUsuario,
        telefono,
        medico,
        tipoConsulta,
        descripcion,
        fecha: citaSeleccionada.fecha,
        hora: citaSeleccionada.hora,
        mascotaId: mascotaSeleccionada,
        mascota: {
          nombre: nombreMascota,
          especie,
          raza,
          sexo,
          edadAproximada,
          peso,
        },
      };

      await api.post('/v1/citas', nuevaCita);
      alert('Cita agendada exitosamente');
      localStorage.removeItem('citaSeleccionada');
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agendar-cita-container">
      {/* Header */}
      <header className="agendar-header">
        <div className="header-content">
          <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</h1>
          <nav className="nav-tabs">
            <button className="nav-tab">One</button>
            <button className="nav-tab">Two</button>
            <button className="nav-tab">Three</button>
          </nav>
          <div className="header-buttons">
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>Reserva Online</button>
            {token ? (
              <button className="btn-primary" onClick={() => navigate('/dashboard/tutor')}>
                Dashboard
              </button>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Ingresa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="form-content">
        {/* Pet Details Section */}
        <div className="form-section">
          <h3>Detalles de la Mascota</h3>

          <div className="form-group">
            <label>Selecciona tu Mascota:</label>
            <select
              value={mascotaSeleccionada}
              onChange={(e) => handleMascotaSeleccionada(e.target.value)}
            >
              <option value="">-- Selecciona una mascota --</option>
              {mascotas.map((mascota) => (
                <option key={mascota.idMascota} value={mascota.idMascota}>
                  {mascota.nomMascota}
                </option>
              ))}
            </select>
          </div>

          {/* Pet Info Section */}
          <div className="pet-info-section">
            <div className="pet-image-placeholder"></div>

            <div className="pet-info-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la Mascota:</label>
                  <input
                    type="text"
                    value={nombreMascota}
                    onChange={(e) => setNombreMascota(e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div className="form-group">
                  <label>Sexo:</label>
                  <input
                    type="text"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    placeholder="Sexo"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Especie:</label>
                  <input
                    type="text"
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                    placeholder="Especie"
                  />
                </div>
                <div className="form-group">
                  <label>Edad Aproximada:</label>
                  <input
                    type="text"
                    value={edadAproximada}
                    onChange={(e) => setEdadAproximada(e.target.value)}
                    placeholder="Edad"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Raza:</label>
                  <input
                    type="text"
                    value={raza}
                    onChange={(e) => setRaza(e.target.value)}
                    placeholder="Raza"
                  />
                </div>
                <div className="form-group">
                  <label>Peso:</label>
                  <input
                    type="text"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Peso"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Form Section */}
        <div className="form-section">
          <h3>Agendar Cita Veterinaria</h3>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Usuario:</label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Selecciona el Médico:</label>
              <select
                value={medico}
                onChange={(e) => setMedico(e.target.value)}
                required
              >
                <option value="">-- Selecciona un médico --</option>
                <option value="medico1">Dr. Juan Pérez</option>
                <option value="medico2">Dra. María García</option>
                <option value="medico3">Dr. Carlos López</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Consulta:</label>
              <select
                value={tipoConsulta}
                onChange={(e) => setTipoConsulta(e.target.value)}
                required
              >
                <option value="">-- Selecciona un tipo de consulta --</option>
                <option value="control">Control</option>
                <option value="vacuna">Vacuna</option>
                <option value="examen">Exámen</option>
                <option value="operacion">Operación</option>
              </select>
            </div>

            <div className="form-group">
              <label>Descripción de la Consulta:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente el motivo de la consulta..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? 'Agendando...' : 'Agendar Cita'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
