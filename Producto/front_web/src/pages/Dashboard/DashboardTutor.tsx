import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import PetCard from '../../components/PetCard';
import type { Mascota } from '../../components/PetCard/PetCard.types';
import type { Reserva } from '../../interfaces/Reserva';
import { esProxima, ordenarAsc, formatFecha, formatHora } from '../../utils/reservas';
import '../../styles/Dashboard.css';
import '../../styles/DashboardMascotas.css';

interface Control {
  id: string;
  mascota: string;
  medico: string;
  tipoConsulta: string;
  fecha: string;
}

export default function DashboardTutor() {
  const navigate = useNavigate();
  const location = useLocation();
  const nombreUsuario = useNombreUsuario();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [ultimosControles] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar autenticación
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('❌ No hay token en localStorage, redirigiendo a login');
          navigate('/login');
          return;
        }

        console.log('✓ DashboardTutor - Token presente');

        // Intentar cargar mascotas
        try {
          const mascotasData = await api.get('/v1/mascotas');
          setMascotas(mascotasData.data);
          console.log('✓ Mascotas cargadas:', mascotasData.data.length);
        } catch (err: any) {
          console.error('Error al cargar mascotas:', err);
          if (err.response?.status === 401) {
            throw err; // Token inválido
          }
        }

        // Intentar cargar las citas (reservas) del tutor
        try {
          const reservasData = await api.get('/v1/reservas');
          setReservas(reservasData.data ?? []);
        } catch (err: any) {
          console.error('Error al cargar citas:', err);
          if (err.response?.status === 401) {
            throw err;
          }
        }

      } catch (error: any) {
        console.error('❌ Error al cargar datos:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
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

  // Si llegamos desde otra página pidiendo bajar a una sección (ej. "Mascotas"
  // o "Control Médico" del sidebar), hacemos scroll una vez cargados los datos.
  useEffect(() => {
    if (loading) return;
    const target = (location.state as any)?.scrollTo;
    if (target) {
      requestAnimationFrame(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [loading, location.state]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Próximas citas: solo las futuras, ordenadas de la más cercana a la más lejana
  const proximasCitas = reservas.filter(esProxima).sort(ordenarAsc);

  const handleEditMascota = (mascota: Mascota) => {
    navigate(`/dashboard/tutor/mascota/${mascota.idMascota}/editar`, { state: { mascota } });
  };

  const handleDeleteMascota = async (id: number) => {
    try {
      await api.delete(`/v1/mascotas/${id}`);
      setMascotas(mascotas.filter(m => m.idMascota !== id));
      alert('Mascota eliminada correctamente');
    } catch (error: any) {
      console.error('Error al eliminar la mascota:', error);
      alert('Error al eliminar la mascota');
    }
  };

  const handlePetCardClick = (mascota: Mascota) => {
    navigate(`/dashboard/tutor/mascota/${mascota.idMascota}`, { state: { mascota } });
  };

  const handleLogout = () => {
    console.log('Logout iniciado');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    console.log('✓ localStorage limpiado');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <nav className="nav-tabs">
          <button className="nav-tab">Mis Mascotas</button>
        </nav>
        <div className="user-section">
          <span className="notification">🔔</span>
          <UserMenu nombre={nombreUsuario} onLogout={handleLogout} />
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor/perfil')}>👤 Perfil</button>
            <button className="nav-item active" onClick={scrollToTop}>🏠 Home</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor/citas')}>📅 Citas</button>
            <button className="nav-item" onClick={() => scrollToSection('controles')}>🏥 Control Médico</button>
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
                <div className="mascotas-header">
                  <h2>Próximas Citas</h2>
                  <button className="btn-add-mascota" onClick={() => navigate('/agendarCita')}>
                    + Agendar Cita
                  </button>
                </div>
                {proximasCitas.length === 0 ? (
                  <p className="hint-text">No tienes citas próximas. Agenda una nueva hora médica.</p>
                ) : (
                  <>
                    <div className="citas-cards">
                      {proximasCitas.slice(0, 3).map((cita) => (
                        <div
                          key={cita.idReserva}
                          className="cita-card"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate('/dashboard/tutor/citas')}
                        >
                          <h4>🐾 {cita.nombreMascota}</h4>
                          <p>📅 {formatFecha(cita.fecHrInicio)} · {formatHora(cita.fecHrInicio)}</p>
                          <p>{cita.nombreVeterinario}</p>
                        </div>
                      ))}
                    </div>
                    <button className="btn-link" onClick={() => navigate('/dashboard/tutor/citas')}>
                      Ver todas mis citas
                    </button>
                  </>
                )}
              </section>

              {/* Últimos Controles */}
              <section className="dashboard-section" id="controles" style={{ scrollMarginTop: '90px' }}>
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
              <section className="dashboard-section mascotas-section" id="mascotas" style={{ scrollMarginTop: '90px' }}>
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
