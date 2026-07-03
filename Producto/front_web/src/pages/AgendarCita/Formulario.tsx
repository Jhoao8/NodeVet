import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/client';
import type { CitaSeleccionada } from '../../interfaces/Agenda';
import { getDashboardPath } from '../../utils/authUtils';
import { getPrecioCita, formatCLP } from '../../config/precioCita';
import '../../styles/AgendarCita.css';

interface Mascota {
  idMascota: number;
  nomMascota: string;
  especie?: string;
}

const ID_VALOR_PLACEHOLDER = 1;

export default function FormularioAgendarCita() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [error, setError] = useState('');

  const [citaSeleccionada] = useState<CitaSeleccionada | null>(() => {
    const guardada = localStorage.getItem('citaSeleccionada');
    if (!guardada) return null;
    try {
      return JSON.parse(guardada) as CitaSeleccionada;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!citaSeleccionada) navigate('/agendarCita');
  }, [citaSeleccionada, navigate]);

  useEffect(() => {
    if (!token) {
      setCargandoMascotas(false);
      return;
    }
    let cancelado = false;
    const fetchMascotas = async () => {
      try {
        const resp = await api.get<Mascota[]>('/v1/mascotas');
        if (!cancelado) setMascotas(Array.isArray(resp.data) ? resp.data : []);
      } catch {
        if (!cancelado) setError('No se pudieron cargar tus mascotas.');
      } finally {
        if (!cancelado) setCargandoMascotas(false);
      }
    };
    fetchMascotas();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mascotaSeleccionada) {
      setError('Selecciona una mascota para continuar.');
      return;
    }
    if (!citaSeleccionada) {
      setError('No hay un horario seleccionado. Vuelve a elegir día y hora.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const urlDinamica = window.location.origin + '/pago/resultado';
      
      const resp = await api.post('/v1/reservas', {
        idMascota: Number(mascotaSeleccionada),
        idVet: citaSeleccionada.idVet,
        idBloque: citaSeleccionada.idBloque,
        idValor: ID_VALOR_PLACEHOLDER,
        returnUrl: urlDinamica
      });

      const urlPago: string | undefined = resp.data?.urlPago;
      localStorage.removeItem('citaSeleccionada');

      if (urlPago) {
        window.location.href = urlPago;
      } else {
        navigate('/pago/resultado');
      }
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (typeof err.response?.data === 'string' ? err.response.data : 'No se pudo agendar la cita.')
        : 'No se pudo agendar la cita.';
      setError(msg);
      setLoading(false);
    }
  };

  const precioCita = getPrecioCita();
  const precioCitaTexto = precioCita !== null ? formatCLP(precioCita) : 'Por confirmar';

  return (
    <div className="agendar-cita-container">
      <header className="agendar-header">
        <div className="header-content">
          <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</h1>
          <nav className="nav-tabs">
            <button className="nav-tab" onClick={() => navigate(getDashboardPath())}>Dashboard</button>
          </nav>
          <div className="header-buttons">
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>Reserva Online</button>
            {token ? (
              <button className="btn-primary" onClick={() => navigate(getDashboardPath())}>Perfil</button>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/login')}>Ingresa</button>
            )}
          </div>
        </div>
      </header>

      <div className="form-content">
        {/* Selección de mascota */}
        <div className="form-section">
          <h3>Selecciona tu Mascota</h3>

          {cargandoMascotas ? (
            <p className="hint-text">Cargando mascotas...</p>
          ) : mascotas.length === 0 ? (
            <div className="no-mascotas">
              <p>No tienes mascotas registradas. Agrega una para poder agendar.</p>
              <button className="btn-primary" onClick={() => navigate('/agregar-mascota')}>
                Agregar mascota
              </button>
            </div>
          ) : (
            <div className="form-group">
              <label>Mascota:</label>
              <select
                value={mascotaSeleccionada}
                onChange={(e) => setMascotaSeleccionada(e.target.value)}
              >
                <option value="">-- Selecciona una mascota --</option>
                {mascotas.map((m) => (
                  <option key={m.idMascota} value={m.idMascota}>
                    {m.nomMascota}{m.especie ? ` (${m.especie})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Resumen + confirmación */}
        <div className="form-section">
          <h3>Resumen de tu Cita</h3>

          {error && <div className="error-message">{error}</div>}

          {citaSeleccionada ? (
            <div className="resumen-cita">
              <div className="resumen-item">
                <span className="resumen-label">Especialidad:</span>
                <span className="resumen-valor">{citaSeleccionada.especialidad}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Veterinario:</span>
                <span className="resumen-valor">{citaSeleccionada.nombreVet}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Fecha:</span>
                <span className="resumen-valor">{citaSeleccionada.fecha}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Hora:</span>
                <span className="resumen-valor">{citaSeleccionada.hora}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Valor:</span>
                <span className="resumen-valor">{precioCitaTexto}</span>
              </div>
            </div>
          ) : (
            <p className="hint-text">Cargando datos de la cita...</p>
          )}

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={loading || !citaSeleccionada || mascotas.length === 0}
            >
              {loading ? 'Generando orden de pago...' : 'Confirmar y pagar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
