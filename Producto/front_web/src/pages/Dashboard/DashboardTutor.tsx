import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import PetCard from '../../components/PetCard';
import type { Mascota } from '../../components/PetCard/PetCard.types';
import '../../styles/Dashboard.css';
import '../../styles/DashboardMascotas.css';

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
  const [proximasCitas] = useState<Cita[]>([]);
  const [ultimosControles] = useState<Control[]>([]);
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

  const handleEditMascota = (mascota: Mascota) => {
    navigate('/agregar-mascota', { state: { mascota, isEditing: true } });
  };

  const handleDeleteMascota = async (id: number) => {
    try {
      await api.delete(`/v1/mascotas/eliminar/${id}`);
      setMascotas(mascotas.filter(m => m.idMascota !== id));
      alert('Mascota eliminada correctamente');
    } catch (error: any) {
      console.error('Error al eliminar la mascota:', error);
      alert('Error al eliminar la mascota');
    }
  };

  const handlePetCardClick = (mascota: Mascota) => {
    // Aquí puedes navegar a la página de detalles de la mascota
    console.log('Ver detalles de:', mascota.nomMascota);
    // navigate(`/mascota/${mascota.idMascota}`);
  };

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
            <button className="nav-item active">👤 Perfil</button>
            <button className="nav-item">🏠 Home</button>
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

              {/* Mascotas - PetCards */}
              <section className="dashboard-section mascotas-section">
                <div className="mascotas-header">
                  <h2>Mis Mascotas</h2>
                  <button 
                    className="btn-add-mascota"
                    onClick={() => navigate('/agregar-mascota')}
                  >
                    + Agregar Mascota
                  </button>
                </div>
                
                {mascotas.length === 0 ? (
                  <div className="no-mascotas">
                    <p>No tienes mascotas registradas aún</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/agregar-mascota')}
                    >
                      Agregar tu primera mascota
                    </button>
                  </div>
                ) : (
                  <div className="pet-cards-grid">
                    {mascotas.map((mascota) => (
                      <PetCard
                        key={mascota.idMascota}
                        mascota={mascota}
                        onEdit={handleEditMascota}
                        onDelete={handleDeleteMascota}
                        onClick={() => handlePetCardClick(mascota)}
                      />
                    ))}
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
