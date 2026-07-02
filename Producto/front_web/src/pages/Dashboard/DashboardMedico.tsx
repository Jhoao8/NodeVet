import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import type { Reserva } from '../../interfaces/Reserva';
import {
  esProxima,
  ordenarAsc,
  ordenarDesc,
  formatFecha,
  formatHora,
  claseEstado,
} from '../../utils/reservas';
import '../../styles/Dashboard.css';
import '../../styles/Citas.css';

// Panel del veterinario: muestra sus citas asignadas reales (GET /v1/reservas
// devuelve las reservas del veterinario autenticado) y permite iniciar la
// atención de una consulta con la reserva ya preseleccionada.

const ID_ESTADO_CONFIRMADA = 2;

function esDeHoy(r: Reserva): boolean {
  const d = new Date(r.fecHrInicio);
  const hoy = new Date();
  return (
    d.getFullYear() === hoy.getFullYear() &&
    d.getMonth() === hoy.getMonth() &&
    d.getDate() === hoy.getDate()
  );
}

export default function DashboardMedico() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    let cancelado = false;
    api
      .get<Reserva[]>('/v1/reservas')
      .then((resp) => {
        if (!cancelado) setReservas(Array.isArray(resp.data) ? resp.data : []);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }
        setError('No se pudieron cargar tus citas. Intenta nuevamente.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const irAAtender = (idReserva: number) =>
    navigate(`/dashboard/medico/atencion?reserva=${idReserva}`);

  const citasHoy = reservas.filter(esDeHoy).sort(ordenarAsc);
  const proximas = reservas.filter((r) => esProxima(r) && !esDeHoy(r)).sort(ordenarAsc);
  const pasadas = reservas.filter((r) => !esProxima(r) && !esDeHoy(r)).sort(ordenarDesc);

  const filaCita = (cita: Reserva, conAccion: boolean) => (
    <tr key={cita.idReserva}>
      <td>{formatFecha(cita.fecHrInicio)}</td>
      <td>{formatHora(cita.fecHrInicio)} - {formatHora(cita.fecHrFin)}</td>
      <td>{cita.nombreMascota}</td>
      <td>{cita.nombreTutor}</td>
      <td>
        <span className={`cita-estado cita-estado--${claseEstado(cita.estadoReserva)}`}>
          {cita.estadoReserva}
        </span>
      </td>
      {conAccion && (
        <td>
          {cita.idEstadoReserva === ID_ESTADO_CONFIRMADA ? (
            <button className="btn-row edit" onClick={() => irAAtender(cita.idReserva)}>
              🩺 Atender
            </button>
          ) : (
            <span className="field-hint">—</span>
          )}
        </td>
      )}
    </tr>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <nav className="nav-tabs">
          <button className="nav-tab" onClick={() => navigate('/dashboard/medico')}>
            ⚕️ Mis Citas
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
            <button className="nav-item active">🏠 Home</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/medico/atencion')}>🩺 Atender consulta</button>
          </nav>
        </aside>

        <main className="main-content">
          {loading ? (
            <div className="loading">Cargando tus citas...</div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}

              {/* ─── Agenda de hoy ─── */}
              <section className="dashboard-section">
                <h2>Agenda de Hoy</h2>
                {citasHoy.length === 0 ? (
                  <p className="hint-text">No tienes citas agendadas para hoy.</p>
                ) : (
                  <div className="citas-cards">
                    {citasHoy.map((cita) => (
                      <div key={cita.idReserva} className="cita-card">
                        <h4>🐾 {cita.nombreMascota}</h4>
                        <p>🕐 {formatHora(cita.fecHrInicio)} - {formatHora(cita.fecHrFin)}</p>
                        <p>👤 {cita.nombreTutor}</p>
                        <p>
                          <span className={`cita-estado cita-estado--${claseEstado(cita.estadoReserva)}`}>
                            {cita.estadoReserva}
                          </span>
                        </p>
                        {cita.idEstadoReserva === ID_ESTADO_CONFIRMADA && (
                          <button
                            className="btn-submit"
                            style={{ marginTop: '8px' }}
                            onClick={() => irAAtender(cita.idReserva)}
                          >
                            🩺 Atender
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ─── Próximas citas ─── */}
              <section className="dashboard-section">
                <h3>Próximas Citas</h3>
                {proximas.length === 0 ? (
                  <p className="hint-text">No tienes citas próximas agendadas.</p>
                ) : (
                  <div className="tabla-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Horario</th>
                          <th>Mascota</th>
                          <th>Tutor</th>
                          <th>Estado</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>{proximas.map((c) => filaCita(c, true))}</tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* ─── Historial ─── */}
              <section className="dashboard-section">
                <h3>Historial de Citas</h3>
                {pasadas.length === 0 ? (
                  <p className="hint-text">Aún no registras citas pasadas.</p>
                ) : (
                  <div className="tabla-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Horario</th>
                          <th>Mascota</th>
                          <th>Tutor</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>{pasadas.map((c) => filaCita(c, false))}</tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
