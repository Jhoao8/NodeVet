import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';

// Espejo web de las pantallas móviles del veterinario:
// - DetalleCitaVetScreen: agenda del día (GET /v1/reservas/veterinario/agenda)
//   con control de ingreso (¿el paciente se presentó?).
// - VetHistorialScreen: historial clínico (GET /v1/consultas/veterinario/historial).

interface ReservaVetDia {
  idReserva: number;
  hora: string;
  tutor: string;
  mascota: string;
}

interface ConsultaHistorial {
  idConsulta: number;
  idReserva: number;
  fecha?: string;
  diagnostico?: string;
  notas?: string;
  indicacionReceta?: string;
}

function toApiDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toDisplayDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function inicioDeDia(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DashboardMedico() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();

  const hoy = inicioDeDia(new Date());

  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [reservasDia, setReservasDia] = useState<ReservaVetDia[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);

  const [historial, setHistorial] = useState<ConsultaHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // Control de ingreso (¿asistió el paciente?)
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaVetDia | null>(null);
  const [registrandoAusencia, setRegistrandoAusencia] = useState(false);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const fetchAgendaDia = useCallback(async (fecha: Date) => {
    setLoadingAgenda(true);
    try {
      const resp = await api.get<ReservaVetDia[]>('/v1/reservas/veterinario/agenda', {
        params: { fecha: toApiDate(fecha) },
      });
      setReservasDia(Array.isArray(resp.data) ? resp.data : []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
        return;
      }
      setReservasDia([]);
      if (err.response?.status !== 404) {
        setError('No se pudo cargar la agenda diaria.');
      }
    } finally {
      setLoadingAgenda(false);
    }
  }, [navigate]);

  const fetchHistorial = useCallback(async () => {
    setLoadingHistorial(true);
    try {
      const resp = await api.get<ConsultaHistorial[]>('/v1/consultas/veterinario/historial');
      setHistorial(Array.isArray(resp.data) ? resp.data : []);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchAgendaDia(fechaSeleccionada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaSeleccionada]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const puedeRetroceder = inicioDeDia(fechaSeleccionada) > hoy;

  const cambiarDia = (offset: number) => {
    setFechaSeleccionada((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset);
      // No se permite navegar a días anteriores a hoy (igual que el móvil)
      if (inicioDeDia(next) < hoy) return prev;
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // "No se presentó": registra la inasistencia y libera el bloque clínico
  const handleNoAsistio = async () => {
    if (!reservaSeleccionada) return;
    setRegistrandoAusencia(true);
    setError('');
    setExito('');
    try {
      await api.post('/v1/consultas', {
        idReserva: reservaSeleccionada.idReserva,
        asistio: false,
        diagnostico: null,
        indicacionReceta: null,
        notas: null,
      });
      setReservaSeleccionada(null);
      setExito('Se ha guardado el estado de ausencia y liberado el bloque clínico.');
      fetchAgendaDia(fechaSeleccionada);
      fetchHistorial();
    } catch {
      setError('No se pudo guardar el registro de inasistencia.');
      setReservaSeleccionada(null);
    } finally {
      setRegistrandoAusencia(false);
    }
  };

  // "Sí se presentó": va al formulario de atención con la reserva preseleccionada
  const handleSiAsistio = () => {
    if (!reservaSeleccionada) return;
    navigate(
      `/dashboard/medico/atencion?reserva=${reservaSeleccionada.idReserva}` +
        `&mascota=${encodeURIComponent(reservaSeleccionada.mascota)}` +
        `&tutor=${encodeURIComponent(reservaSeleccionada.tutor)}` +
        `&hora=${encodeURIComponent(reservaSeleccionada.hora)}`,
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <nav className="nav-tabs">
          <button className="nav-tab" onClick={() => navigate('/dashboard/medico')}>
            ⚕️ Mi Agenda
          </button>
        </nav>
        <div className="user-section">
          <span className="notification">🔔</span>
          <UserMenu nombre={nombreUsuario} onLogout={handleLogout} />
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard/medico/perfil')}>👤 Perfil</button>
            <button className="nav-item active">🏠 Agenda del Día</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/medico/atencion')}>🩺 Atender consulta</button>
          </nav>
        </aside>

        <main className="main-content">
          {error && <div className="error-message">{error}</div>}
          {exito && <div className="success-message">{exito}</div>}

          {/* ─── Agenda del Día (espejo de DetalleCitaVetScreen) ─── */}
          <section className="dashboard-section">
            <h2>Agenda del Día</h2>

            <div className="agenda-dia-nav">
              <button
                type="button"
                className="agenda-dia-flecha"
                onClick={() => cambiarDia(-1)}
                disabled={!puedeRetroceder}
                aria-label="Día anterior"
              >
                ‹
              </button>
              <span className="agenda-dia-fecha">{toDisplayDate(fechaSeleccionada)}</span>
              <button
                type="button"
                className="agenda-dia-flecha"
                onClick={() => cambiarDia(1)}
                aria-label="Día siguiente"
              >
                ›
              </button>
            </div>

            {loadingAgenda ? (
              <div className="loading">Cargando agenda...</div>
            ) : reservasDia.length === 0 ? (
              <div className="vets-empty">
                <span className="vets-empty-icon" aria-hidden>🗓️</span>
                <p>
                  <strong>Sin reservas para este día.</strong> Avanza o retrocede con las
                  flechas para revisar otras fechas.
                </p>
              </div>
            ) : (
              <div className="citas-cards">
                {reservasDia.map((reserva) => (
                  <button
                    type="button"
                    key={reserva.idReserva}
                    className="cita-card reserva-vet-card"
                    onClick={() => setReservaSeleccionada(reserva)}
                  >
                    <h4>🕐 {reserva.hora}</h4>
                    <p>🐾 {reserva.mascota}</p>
                    <p>👤 {reserva.tutor}</p>
                    <p className="field-hint">Haz clic para el control de ingreso</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ─── Historial clínico (espejo de VetHistorialScreen) ─── */}
          <section className="dashboard-section">
            <h3>Historial Clínico de Consultas</h3>
            <p className="field-hint" style={{ display: 'block', marginBottom: '12px' }}>
              Solo se muestran atenciones médicas completadas con éxito.
            </p>

            {loadingHistorial ? (
              <div className="loading">Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div className="vets-empty">
                <span className="vets-empty-icon" aria-hidden>📋</span>
                <p>
                  <strong>Sin consultas completadas.</strong> Las ausencias y reservas no
                  atendidas no aparecen en este historial.
                </p>
              </div>
            ) : (
              <div className="tabla-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Reserva</th>
                      <th>Diagnóstico</th>
                      <th>Indicación de receta</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((c) => (
                      <tr key={c.idConsulta}>
                        <td>{c.fecha || 'Sin fecha'}</td>
                        <td>#{c.idReserva}</td>
                        <td>{c.diagnostico || 'Sin diagnóstico registrado'}</td>
                        <td>{c.indicacionReceta || 'Sin indicación registrada'}</td>
                        <td>{c.notas || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ─── Modal: Control de Ingreso ─── */}
      {reservaSeleccionada && (
        <div className="modal-overlay" onClick={() => !registrandoAusencia && setReservaSeleccionada(null)}>
          <div className="modal-content jornada-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Control de Ingreso</h2>
              <p>
                {reservaSeleccionada.hora} | {reservaSeleccionada.tutor} | {reservaSeleccionada.mascota}
              </p>
            </div>
            <div className="modal-body">
              <p style={{ textAlign: 'center', margin: 0 }}>
                ¿El paciente se presentó a la hora del bloque médico?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-desactivar-vet"
                onClick={handleNoAsistio}
                disabled={registrandoAusencia}
              >
                {registrandoAusencia ? 'Registrando...' : 'No se presentó (Ausente)'}
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={handleSiAsistio}
                disabled={registrandoAusencia}
              >
                Sí, se presentó
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
