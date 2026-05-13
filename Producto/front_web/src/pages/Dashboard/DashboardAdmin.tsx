import { useState, useEffect } from 'react';
import api from '../../api/client';
import '../../styles/Dashboard.css';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
}

interface Mascota {
  id: string;
  nombre: string;
  tutor: string;
  fecha: string;
  estado: string;
}

interface Cita {
  id: string;
  mascota: string;
  tutor: string;
  medico: string;
  tipoConsulta: string;
  fecha: string;
  estado: string;
}

export default function DashboardAdmin() {
  const [admin, setAdmin] = useState({ nombre: 'Admin' });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [stats, setStats] = useState({
    medicos: 0,
    tutores: 0,
    mascotas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminData = await api.get('/v1/admin/perfil');
        setAdmin(adminData.data);

        const statsData = await api.get('/v1/admin/stats');
        setStats(statsData.data);

        const usuariosData = await api.get('/v1/admin/usuarios');
        setUsuarios(usuariosData.data);

        const mascotasData = await api.get('/v1/admin/mascotas');
        setMascotas(mascotasData.data);

        const citasData = await api.get('/v1/admin/citas');
        setCitas(citasData.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <span className="username">{admin.nombre}</span>
          <button className="user-menu">👤</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item active">🏠 Home</button>
            <button className="nav-item">👥 Usuarios</button>
            <button className="nav-item">🐾 Mascotas</button>
            <button className="nav-item">📅 Citas</button>
            <button className="nav-item">📊 Controles</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              {/* Dashboard Stats */}
              <section className="dashboard-section">
                <h2>Dashboard</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-icon">⚕️</span>
                    <h4>Médicos</h4>
                    <p className="stat-number">{stats.medicos}</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">👤</span>
                    <h4>Tutores</h4>
                    <p className="stat-number">{stats.tutores}</p>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🐾</span>
                    <h4>Mascotas</h4>
                    <p className="stat-number">{stats.mascotas}</p>
                  </div>
                </div>
              </section>

              <div className="admin-grid">
                {/* Usuarios Section */}
                <section className="dashboard-section">
                  <h3>Usuarios</h3>
                  <div className="action-buttons">
                    <button className="btn-secondary">Crear Médico</button>
                    <button className="btn-secondary">Listar</button>
                    <button className="btn-secondary">Modificar</button>
                    <button className="btn-secondary">Eliminar</button>
                  </div>
                </section>

                {/* Citas Section */}
                <section className="dashboard-section">
                  <h3>Citas</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Tutor</th>
                        <th>Médico</th>
                        <th>Tipo Consulta</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map((cita) => (
                        <tr key={cita.id}>
                          <td>{cita.mascota}</td>
                          <td>{cita.tutor}</td>
                          <td>{cita.medico}</td>
                          <td>{cita.tipoConsulta}</td>
                          <td>{cita.fecha}</td>
                          <td>
                            <span className={`status ${cita.estado.toLowerCase()}`}>
                              {cita.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                {/* Mascotas Section */}
                <section className="dashboard-section">
                  <h3>Mascotas</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mascota</th>
                        <th>Tutor</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mascotas.map((mascota) => (
                        <tr key={mascota.id}>
                          <td>{mascota.id}</td>
                          <td>{mascota.nombre}</td>
                          <td>{mascota.tutor}</td>
                          <td>{mascota.fecha}</td>
                          <td>
                            <span className={`status ${mascota.estado.toLowerCase()}`}>
                              {mascota.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
