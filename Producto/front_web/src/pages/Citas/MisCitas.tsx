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
  formatMonto,
  claseEstado,
} from '../../utils/reservas';
import '../../styles/Dashboard.css';
import '../../styles/Citas.css';

function CitaCard({ cita }: { cita: Reserva }) {
  return (
    <div className="cita-row">
      <div className="cita-row-fecha">
        <span className="cita-dia">{formatFecha(cita.fecHrInicio)}</span>
        <span className="cita-hora">🕐 {formatHora(cita.fecHrInicio)}</span>
      </div>
      <div className="cita-row-info">
        <span className="cita-mascota">🐾 {cita.nombreMascota}</span>
        <span className="cita-vet">{cita.nombreVeterinario}</span>
      </div>
      <div className="cita-row-meta">
        <span className={`cita-estado cita-estado--${claseEstado(cita.estadoReserva)}`}>
          {cita.estadoReserva}
        </span>
        {cita.monto != null && <span className="cita-monto">{formatMonto(cita.monto)}</span>}
      </div>
    </div>
  );
}

export default function MisCitas() {
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
      .get('/v1/reservas')
      .then((resp) => {
        if (!cancelado) setReservas(resp.data ?? []);
      })
      .catch((err) => {
        if (!cancelado && err.response?.status !== 401) {
          setError('No se pudieron cargar tus citas.');
        }
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

  const proximas = reservas.filter(esProxima).sort(ordenarAsc);
  const pasadas = reservas.filter((r) => !esProxima(r)).sort(ordenarDesc);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
          NodeVet
        </div>
        <nav className="nav-tabs">
          <button className="nav-tab" onClick={() => navigate('/dashboard/tutor')}>
            Mis Mascotas
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
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor/perfil')}>👤 Perfil</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor')}>🏠 Home</button>
            <button className="nav-item active">📅 Citas</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor', { state: { scrollTo: 'controles' } })}>🏥 Control Médico</button>
          </nav>
        </aside>

        <main className="main-content">
          <div className="citas-wrap">
            <div className="citas-head">
              <h2>Mis Citas</h2>
              <button className="btn-add-mascota" onClick={() => navigate('/agendarCita')}>
                + Agendar nueva cita
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="dashboard-section">
                <div className="loading">Cargando tus citas...</div>
              </div>
            ) : reservas.length === 0 ? (
              <div className="dashboard-section">
                <p className="hint-text">
                  Aún no tienes citas. Agenda tu primera hora médica.
                </p>
                <button className="btn-primary" onClick={() => navigate('/agendarCita')}>
                  Agendar una cita
                </button>
              </div>
            ) : (
              <>
                <section className="dashboard-section">
                  <div className="citas-section-head">
                    <h3>Próximas</h3>
                    {proximas.length > 0 && <span className="citas-count">{proximas.length}</span>}
                  </div>
                  {proximas.length === 0 ? (
                    <p className="hint-text">No tienes citas próximas.</p>
                  ) : (
                    <div className="citas-list">
                      {proximas.map((c) => (
                        <CitaCard key={c.idReserva} cita={c} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="dashboard-section">
                  <div className="citas-section-head">
                    <h3>Historial</h3>
                    {pasadas.length > 0 && <span className="citas-count">{pasadas.length}</span>}
                  </div>
                  {pasadas.length === 0 ? (
                    <p className="hint-text">No hay citas pasadas.</p>
                  ) : (
                    <div className="citas-list">
                      {pasadas.map((c) => (
                        <CitaCard key={c.idReserva} cita={c} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
