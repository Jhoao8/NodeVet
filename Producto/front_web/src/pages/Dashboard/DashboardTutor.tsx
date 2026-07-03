import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import PetCard from '../../components/PetCard';
import type { Mascota } from '../../components/PetCard/PetCard.types';
import '../../styles/Dashboard.css';
import '../../styles/DashboardMascotas.css';
import '../../styles/DetalleMascota.css';

// Próxima cita del tutor tal como la entrega GET /v1/reservas/proximas
interface ProximaCitaHome {
  idReserva: number;
  fecha: string;
  hora: string;
  mascota: string;
  fechaHoraInicio: string;
  cancelable: boolean;
}

// Consulta con receta, agregada por mascota (espejo de OrdenMedicaScreen móvil)
interface OrdenMedicaItem {
  idConsulta: number;
  idMascota: number;
  nombreMascota: string;
  fecha: string;
  profesional: string;
  diagnostico: string;
  notas: string;
  indicacionReceta: string;
}

export default function DashboardTutor() {
  const navigate = useNavigate();
  const location = useLocation();
  const nombreUsuario = useNombreUsuario();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [proximasCitas, setProximasCitas] = useState<ProximaCitaHome[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenMedicaItem[]>([]);
  const [filtroMascota, setFiltroMascota] = useState<string>('todas');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenMedicaItem | null>(null);

  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarProximasCitas = useCallback(async () => {
    try {
      const resp = await api.get<ProximaCitaHome[]>('/v1/reservas/proximas');
      setProximasCitas(Array.isArray(resp.data) ? resp.data : []);
    } catch (err: any) {
      if (err.response?.status === 401) throw err;
      setProximasCitas([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Mascotas del tutor
        let mascotasData: Mascota[] = [];
        try {
          const resp = await api.get<Mascota[]>('/v1/mascotas');
          mascotasData = Array.isArray(resp.data) ? resp.data : [];
          setMascotas(mascotasData);
        } catch (err: any) {
          if (err.response?.status === 401) throw err;
        }

        // Próximas citas (el backend devuelve hasta 2, igual que el Home móvil)
        await cargarProximasCitas();

        // Órdenes médicas: consultas con receta de todas las mascotas
        const historialPorMascota = await Promise.all(
          mascotasData.map(async (mascota) => {
            try {
              const resp = await api.get(`/v1/consultas/mascota/${mascota.idMascota}`);
              const historial: any[] = Array.isArray(resp.data) ? resp.data : [];
              return historial
                .filter((c) => String(c.indicacionReceta || '').trim().length > 0)
                .map((c) => ({
                  idConsulta: c.idConsulta,
                  idMascota: mascota.idMascota!,
                  nombreMascota: mascota.nomMascota,
                  fecha: c.fecha || 'Sin fecha',
                  profesional: c.profesional || 'Profesional no informado',
                  diagnostico: c.diagnostico || 'Sin diagnóstico registrado',
                  notas: c.notas || '',
                  indicacionReceta: c.indicacionReceta || '',
                }));
            } catch {
              return [];
            }
          }),
        );
        setOrdenes(
          historialPorMascota
            .flat()
            .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))),
        );
      } catch (error: any) {
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
  }, [navigate, cargarProximasCitas]);

  // Si llegamos desde otra página pidiendo bajar a una sección (ej. "Órdenes
  // Médicas" del sidebar), hacemos scroll una vez cargados los datos.
  useEffect(() => {
    if (loading) return;
    const target = (location.state as any)?.scrollTo;
    if (target) {
      requestAnimationFrame(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [loading, location.state]);

  const scrollToTop = () => {
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancela una reserva propia (solo si el backend la marcó como cancelable:
  // sin pago obligatorio y con al menos 24 horas de anticipación).
  const handleCancelarCita = async (cita: ProximaCitaHome) => {
    const confirmar = window.confirm(
      `¿Cancelar la cita de ${cita.mascota} del ${cita.fecha} a las ${cita.hora}? Se liberará el bloque horario.`,
    );
    if (!confirmar) return;

    setCancelandoId(cita.idReserva);
    setError('');
    try {
      await api.delete(`/v1/reservas/${cita.idReserva}/cancelar`);
      await cargarProximasCitas();
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        (typeof data === 'string' && data) || 'No se pudo cancelar la cita. Intenta nuevamente.',
      );
    } finally {
      setCancelandoId(null);
    }
  };

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
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const ordenesFiltradas =
    filtroMascota === 'todas'
      ? ordenes
      : ordenes.filter((o) => o.idMascota === Number(filtroMascota));

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
            <button className="nav-item" onClick={() => navigate('/agendarCita')}>📅 Agendar Cita</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}

              {/* Próximas Citas (hasta 2, igual que el Home móvil) */}
              <section className="dashboard-section">
                <div className="mascotas-header">
                  <h2>Próximas Citas</h2>
                  <button className="btn-add-mascota" onClick={() => navigate('/agendarCita')}>
                    + Agendar Cita
                  </button>
                </div>
                {proximasCitas.length === 0 ? (
                  <p className="hint-text">Sin citas registradas. Agenda una nueva hora médica.</p>
                ) : (
                  <div className="tabla-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Mascota</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proximasCitas.map((cita) => (
                          <tr key={cita.idReserva}>
                            <td>{cita.fecha}</td>
                            <td>{cita.hora}</td>
                            <td>{cita.mascota}</td>
                            <td>
                              {cita.cancelable ? (
                                <button
                                  className="btn-row danger"
                                  onClick={() => handleCancelarCita(cita)}
                                  disabled={cancelandoId === cita.idReserva}
                                >
                                  {cancelandoId === cita.idReserva ? 'Cancelando...' : 'Cancelar'}
                                </button>
                              ) : (
                                <span className="field-hint">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Órdenes Médicas (espejo de OrdenMedicaScreen móvil) */}
              <section className="dashboard-section" id="ordenes" style={{ scrollMarginTop: '90px' }}>
                <div className="mascotas-header">
                  <h3>Órdenes Médicas</h3>
                  {mascotas.length > 0 && ordenes.length > 0 && (
                    <select
                      className="ordenes-filtro"
                      value={filtroMascota}
                      onChange={(e) => setFiltroMascota(e.target.value)}
                    >
                      <option value="todas">Todas las mascotas</option>
                      {mascotas.map((m) => (
                        <option key={m.idMascota} value={m.idMascota}>{m.nomMascota}</option>
                      ))}
                    </select>
                  )}
                </div>

                {ordenesFiltradas.length === 0 ? (
                  <p className="hint-text">Sin órdenes médicas registradas.</p>
                ) : (
                  <div className="tabla-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Mascota</th>
                          <th>Profesional</th>
                          <th>Diagnóstico</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordenesFiltradas.map((orden) => (
                          <tr key={orden.idConsulta}>
                            <td>{orden.fecha}</td>
                            <td>{orden.nombreMascota}</td>
                            <td>{orden.profesional}</td>
                            <td>{orden.diagnostico}</td>
                            <td>
                              <button className="btn-row edit" onClick={() => setOrdenSeleccionada(orden)}>
                                Ver receta
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {/* Modal de detalle de la orden médica */}
      {ordenSeleccionada && (
        <div className="ficha-modal-overlay" onClick={() => setOrdenSeleccionada(null)}>
          <div className="ficha-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ficha-modal-head">
              <div>
                <h3>Orden médica · {ordenSeleccionada.nombreMascota}</h3>
                <span className="ficha-modal-date">📅 {ordenSeleccionada.fecha}</span>
              </div>
              <button
                className="ficha-modal-close"
                onClick={() => setOrdenSeleccionada(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="ficha-modal-body">
              <div className="ficha-row">
                <span className="ficha-label">Profesional</span>
                <span className="ficha-value">{ordenSeleccionada.profesional}</span>
              </div>
              <div className="ficha-block">
                <span className="ficha-label">Diagnóstico</span>
                <p className="ficha-paragraph">{ordenSeleccionada.diagnostico}</p>
              </div>
              <div className="ficha-block">
                <span className="ficha-label">Indicaciones / receta</span>
                <p className="ficha-paragraph">{ordenSeleccionada.indicacionReceta}</p>
              </div>
              {ordenSeleccionada.notas && (
                <div className="ficha-block">
                  <span className="ficha-label">Notas</span>
                  <p className="ficha-paragraph">{ordenSeleccionada.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
