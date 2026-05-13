import { useState, useEffect } from 'react';
import api from '../../api/client';
import '../../styles/Dashboard.css';

interface Cita {
  id: string;
  mascota: string;
  tipoConsulta: string;
  horaInicio: string;
  horaFin: string;
  fecha: string;
}

interface Control {
  id: string;
  mascota: string;
  hora: string;
  tipoConsulta: string;
  fecha: string;
}

export default function DashboardMedico() {
  const [medico, setMedico] = useState({ nombre: 'Médico' });
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);
  const [proximosControles, setProximosControles] = useState<Control[]>([]);
  const [citasPasadas, setCitasPasadas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medicoData = await api.get('/v1/medico/perfil');
        setMedico(medicoData.data);

        const citasData = await api.get('/v1/citas/medico/proximas');
        setProximasCitas(citasData.data);

        const controlesData = await api.get('/v1/controles/medico/proximos');
        setProximosControles(controlesData.data);

        const citasPasadasData = await api.get('/v1/citas/medico/pasadas');
        setCitasPasadas(citasPasadasData.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const horariosDisponibles = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">NodeVet</div>
        <nav className="nav-tabs">
          <button className="nav-tab">One</button>
          <button className="nav-tab">Two</button>
          <button className="nav-tab">Three</button>
        </nav>
        <div className="user-section">
          <span className="notification">🔔</span>
          <span className="username">{medico.nombre}</span>
          <button className="user-menu">👤</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item active">🏠 Home</button>
            <button className="nav-item">👤 Perfil</button>
            <button className="nav-item">👥 Pacientes</button>
            <button className="nav-item">📅 Próximas Citas</button>
            <button className="nav-item">📋 Citas Pasadas</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              {/* Calendar Section */}
              <section className="calendar-section">
                <div className="calendar-header">
                  <h3>Semana 13</h3>
                  <div className="view-controls">
                    <button
                      className={vista === 'dia' ? 'active' : ''}
                      onClick={() => setVista('dia')}
                    >
                      Día
                    </button>
                    <button
                      className={vista === 'semana' ? 'active' : ''}
                      onClick={() => setVista('semana')}
                    >
                      Semana
                    </button>
                    <button
                      className={vista === 'mes' ? 'active' : ''}
                      onClick={() => setVista('mes')}
                    >
                      Mes
                    </button>
                  </div>
                </div>

                <div className="calendar-grid">
                  <div className="day-headers">
                    {diasSemana.map((dia, idx) => (
                      <div key={idx} className="day-header">
                        {dia}
                      </div>
                    ))}
                  </div>

                  <div className="time-slots">
                    {horariosDisponibles.map((hora) => (
                      <div key={hora} className="time-row">
                        <div className="time-label">{hora}</div>
                        {diasSemana.map((_, dayIdx) => (
                          <div
                            key={`${hora}-${dayIdx}`}
                            className={`slot ${Math.random() > 0.6 ? 'occupied' : 'available'}`}
                          >
                            {Math.random() > 0.7 && <span className="mascota">[Mascota X]</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="dashboard-grid">
                {/* Próximas Citas */}
                <section className="dashboard-section">
                  <h3>Próximas Citas</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Tipo Consulta</th>
                        <th>Hora Inicio</th>
                        <th>Hora Término</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximasCitas.map((cita) => (
                        <tr key={cita.id}>
                          <td>{cita.mascota}</td>
                          <td>{cita.tipoConsulta}</td>
                          <td>{cita.horaInicio}</td>
                          <td>{cita.horaFin}</td>
                          <td>{cita.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                {/* Próximos Controles */}
                <section className="dashboard-section">
                  <h3>Próximos Controles</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Hora</th>
                        <th>Tipo Consulta</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximosControles.map((control) => (
                        <tr key={control.id}>
                          <td>{control.mascota}</td>
                          <td>{control.hora}</td>
                          <td>{control.tipoConsulta}</td>
                          <td>{control.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="btn-link">Ver Más</button>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
