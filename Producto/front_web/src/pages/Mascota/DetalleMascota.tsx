import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/client';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import type { Mascota } from '../../components/PetCard/PetCard.types';
import '../../styles/Dashboard.css';
import '../../styles/DetalleMascota.css';

// Ficha clínica tal como la entrega GET /v1/consultas/mascota/{id}
interface Consulta {
  idConsulta: number;
  idReserva: number;
  fecha: string;
  profesional?: string;
  diagnostico?: string;
  notas?: string;
  indicacionReceta?: string;
  archivosUrls?: string[];
}

// Calcula la edad legible a partir de la fecha de nacimiento (YYYY-MM-DD)
function calcularEdad(fecNac?: string): string {
  if (!fecNac) return 'No registrada';
  const nac = new Date(fecNac);
  if (isNaN(nac.getTime())) return 'No registrada';

  const hoy = new Date();
  let anios = hoy.getFullYear() - nac.getFullYear();
  let meses = hoy.getMonth() - nac.getMonth();
  if (hoy.getDate() < nac.getDate()) meses--;
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  if (anios < 0) return 'No registrada';
  if (anios === 0 && meses === 0) return 'Recién nacido';
  if (anios === 0) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  if (meses === 0) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  return `${anios} ${anios === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

export default function DetalleMascota() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const nombreUsuario = useNombreUsuario();

  const mascotaInicial = (location.state as any)?.mascota as Mascota | undefined;

  const [mascota, setMascota] = useState<Mascota | null>(mascotaInicial ?? null);
  const [loading, setLoading] = useState(!mascotaInicial);

  const [historial, setHistorial] = useState<Consulta[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState('');

  const [fichaSel, setFichaSel] = useState<Consulta | null>(null);

  // Si llegamos sin la mascota en el estado (ej. recarga de página), la
  // recuperamos desde la lista del tutor buscándola por id.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    if (mascota || !id) return;

    let cancelado = false;
    api
      .get('/v1/mascotas')
      .then((resp) => {
        if (cancelado) return;
        const encontrada = (resp.data as Mascota[]).find(
          (m) => m.idMascota === Number(id),
        );
        setMascota(encontrada ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, mascota, navigate]);

  // Historial médico real (fichas clínicas de la mascota)
  useEffect(() => {
    if (!id) return;

    let cancelado = false;
    setHistLoading(true);
    setHistError('');
    api
      .get(`/v1/consultas/mascota/${id}`)
      .then((resp) => {
        if (!cancelado) setHistorial(resp.data ?? []);
      })
      .catch((err) => {
        if (!cancelado && err.response?.status !== 401) {
          setHistError('No se pudo cargar el historial médico.');
        }
      })
      .finally(() => {
        if (!cancelado) setHistLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const sexoTexto = mascota?.sexo === 1 ? 'Macho' : 'Hembra';

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
            <button className="nav-item active" onClick={() => navigate('/dashboard/tutor')}>🏠 Home</button>
            <button className="nav-item" onClick={() => navigate('/agendarCita')}>📅 Agendar Cita</button>
          </nav>
        </aside>

        <main className="main-content">
          <div className="mascota-wrap">
            <button className="mascota-back" onClick={() => navigate('/dashboard/tutor')}>
              ← Volver a mis mascotas
            </button>

            {loading ? (
              <div className="dashboard-section">
                <div className="loading">Cargando mascota...</div>
              </div>
            ) : !mascota ? (
              <div className="dashboard-section">
                <p className="hint-text">No se encontró la mascota solicitada.</p>
              </div>
            ) : (
              <>
                {/* ─── Hero con la foto de la mascota ─── */}
                <section
                  className={`mascota-hero ${mascota.imagenMascota ? '' : 'mascota-hero--noimg'}`}
                  style={
                    mascota.imagenMascota
                      ? { backgroundImage: `url(${mascota.imagenMascota})` }
                      : undefined
                  }
                >
                  {!mascota.imagenMascota && <span className="mascota-hero-paw">🐾</span>}
                  <div className="mascota-hero-overlay">
                    <div className="mascota-hero-text">
                      <h1>{mascota.nomMascota || 'Sin nombre'}</h1>
                      <p>
                        {mascota.especie}
                        {mascota.raza ? ` · ${mascota.raza}` : ''}
                      </p>
                    </div>
                    <button
                      className="mascota-hero-edit"
                      onClick={() =>
                        navigate(`/dashboard/tutor/mascota/${mascota.idMascota}/editar`, {
                          state: { mascota },
                        })
                      }
                    >
                      ✎ Editar
                    </button>
                  </div>
                </section>

                {/* ─── Datos de la mascota ─── */}
                <section className="dashboard-section">
                  <h3>Datos de la mascota</h3>
                  <dl className="info-grid">
                    <div className="info-item">
                      <dt>Sexo</dt>
                      <dd>{sexoTexto}</dd>
                    </div>
                    <div className="info-item">
                      <dt>Peso</dt>
                      <dd>{mascota.peso != null ? `${mascota.peso} kg` : 'No registrado'}</dd>
                    </div>
                    <div className="info-item">
                      <dt>Nacimiento</dt>
                      <dd>{mascota.fecNac || 'No registrada'}</dd>
                    </div>
                    <div className="info-item">
                      <dt>Edad</dt>
                      <dd>
                        {calcularEdad(mascota.fecNac)}
                        {mascota.fecNacEst === 1 && mascota.fecNac ? ' (aprox.)' : ''}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* ─── Historial médico (real) ─── */}
                <section className="dashboard-section">
                  <div className="hist-head">
                    <h3>Historial médico</h3>
                    {!histLoading && historial.length > 0 && (
                      <span className="hist-count">
                        {historial.length} {historial.length === 1 ? 'consulta' : 'consultas'}
                      </span>
                    )}
                  </div>

                  {histLoading ? (
                    <div className="loading">Cargando historial...</div>
                  ) : histError ? (
                    <div className="error-message">{histError}</div>
                  ) : historial.length === 0 ? (
                    <p className="hint-text">
                      Esta mascota aún no tiene fichas clínicas registradas.
                    </p>
                  ) : (
                    <ul className="hist-list">
                      {historial.map((c) => (
                        <li key={c.idConsulta} className="hist-item">
                          <div className="hist-item-info">
                            <span className="hist-fecha">📅 {c.fecha}</span>
                            <span className="hist-prof">
                              {c.profesional || 'Profesional no indicado'}
                            </span>
                            <span className="hist-diag">
                              {c.diagnostico || 'Sin diagnóstico registrado'}
                            </span>
                          </div>
                          <button className="btn-secondary" onClick={() => setFichaSel(c)}>
                            Ver ficha
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── Modal de ficha clínica ─── */}
      {fichaSel && (
        <div className="ficha-modal-overlay" onClick={() => setFichaSel(null)}>
          <div className="ficha-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ficha-modal-head">
              <div>
                <h3>Ficha clínica</h3>
                <span className="ficha-modal-date">📅 {fichaSel.fecha}</span>
              </div>
              <button
                className="ficha-modal-close"
                onClick={() => setFichaSel(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="ficha-modal-body">
              <div className="ficha-row">
                <span className="ficha-label">Profesional</span>
                <span className="ficha-value">
                  {fichaSel.profesional || 'No indicado'}
                </span>
              </div>
              <div className="ficha-block">
                <span className="ficha-label">Diagnóstico</span>
                <p className="ficha-paragraph">
                  {fichaSel.diagnostico || 'Sin diagnóstico registrado'}
                </p>
              </div>
              <div className="ficha-block">
                <span className="ficha-label">Notas</span>
                <p className="ficha-paragraph">{fichaSel.notas || 'Sin notas'}</p>
              </div>
              <div className="ficha-block">
                <span className="ficha-label">Indicaciones / receta</span>
                <p className="ficha-paragraph">
                  {fichaSel.indicacionReceta || 'Sin indicaciones'}
                </p>
              </div>

              {fichaSel.archivosUrls && fichaSel.archivosUrls.length > 0 && (
                <div className="ficha-block">
                  <span className="ficha-label">Archivos adjuntos</span>
                  <div className="ficha-archivos">
                    {fichaSel.archivosUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ficha-archivo"
                      >
                        📎 Archivo {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
