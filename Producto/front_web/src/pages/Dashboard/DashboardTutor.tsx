import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/Dashboard.css';

interface Mascota {
  idMascota: number;
  nomMascota: string;
}

interface Cita {
  id: string;
  mascota: string;
  medico: string;
  fecha: string;
  hora: string;
}

interface Control {
  id: string;
  mascota: string;
  medico: string;
  tipoConsulta: string;
  fecha: string;
}

export default function DashboardTutor() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: 'Usuario' });
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);
  const [ultimosControles, setUltimosControles] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.get('/v1/usuarios/perfil');
        setUsuario(userData.data);

        const mascotasData = await api.get('/v1/mascotas/listar');
        setMascotas(mascotasData.data);

      } catch (error: any) {
        console.error('Error al cargar datos:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <nav className="nav-tabs">
          <button className="nav-tab">One</button>
          <button className="nav-tab">Two</button>
          <button className="nav-tab">Three</button>
        </nav>
        <div className="user-section">
          <span className="notification">🔔</span>
          <span className="username">{usuario.nombre}</span>
          <button className="user-menu" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item active">🏠 Home</button>
            <button className="nav-item">👤 Perfil</button>
            <button className="nav-item">🐾 Mascotas</button>
            <button className="nav-item">📅 Citas</button>
            <button className="nav-item">🏥 Control Médico</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              {/* Próximas Citas */}
              <section className="dashboard-section">
                <h2>Próximas Citas</h2>
                <div className="citas-cards">
                  {proximasCitas.slice(0, 2).map((cita) => (
                    <div key={cita.id} className="cita-card">
                      <h4>{cita.mascota}</h4>
                      <p>📅 Fecha: {cita.fecha}</p>
                      <p>🕐 Hora: {cita.hora}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Próximo Control */}
              <section className="dashboard-section">
                <h3>Próximo Control</h3>
                {ultimosControles.length > 0 && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Médico</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{ultimosControles[0].mascota}</td>
                        <td>{ultimosControles[0].medico}</td>
                        <td>{ultimosControles[0].tipoConsulta}</td>
                        <td>{ultimosControles[0].fecha}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </section>

              {/* Últimos Controles */}
              <section className="dashboard-section">
                <h3>Últimos Controles</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mascota</th>
                      <th>Médico</th>
                      <th>Tipo Consulta</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosControles.map((control) => (
                      <tr key={control.id}>
                        <td>{control.mascota}</td>
                        <td>{control.medico}</td>
                        <td>{control.tipoConsulta}</td>
                        <td>{control.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn-link">Ver Más</button>
              </section>

              {/* Mascotas */}
              <section className="dashboard-section">
                <h3>Mascotas</h3>
                <div className="mascotas-grid">
                  {mascotas.map((mascota) => (
                    <div key={mascota.idMascota} className="mascota-card">
                      <div className="mascota-image"></div>
                      <p>{mascota.nomMascota}</p>
                    </div>
                  ))}
                  <div className="mascota-card add-mascota" onClick={() => navigate('/agregar-mascota')}>
                    <div className="mascota-image">+</div>
                    <p>Agregar Mascota</p>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
