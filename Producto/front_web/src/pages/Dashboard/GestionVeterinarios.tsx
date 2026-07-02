import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AdminSidebar from '../../components/AdminSidebar';
import RegistrarVeterinarioForm from '../../components/forms/RegistrarVeterinarioForm';
import UserMenu from '../../components/UserMenu';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import {
  formatEspecialidades,
  getIniciales,
} from '../../interfaces/Veterinario';
import type { VeterinarioDTO } from '../../interfaces/Veterinario';
import '../../styles/Dashboard.css';

// Espejo web de la pantalla móvil GestionVetScreen: lista de veterinarios con
// búsqueda por nombre o especialidad, estado y acceso al detalle.
export default function GestionVeterinarios() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();

  const [vets, setVets] = useState<VeterinarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [error, setError] = useState('');

  const fetchVeterinarios = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await api.get<VeterinarioDTO[]>('/v1/veterinarios');
      setVets(Array.isArray(resp.data) ? resp.data : []);
    } catch {
      setError('No se pudieron cargar los veterinarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVeterinarios();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const query = searchQuery.toLowerCase();
  const filteredVets = vets.filter((vet) => {
    const nombre = vet.nombreCompleto?.toLowerCase() || '';
    const especialidades = formatEspecialidades(vet.especialidades).toLowerCase();
    return nombre.includes(query) || especialidades.includes(query);
  });

  return (
    <>
      {showCrearModal && (
        <RegistrarVeterinarioForm
          onSuccess={() => {
            setShowCrearModal(false);
            fetchVeterinarios();
          }}
          onCancel={() => setShowCrearModal(false)}
        />
      )}

      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
          <div className="user-section">
            <span className="notification">🔔</span>
            <UserMenu nombre={nombreUsuario} onLogout={handleLogout} />
          </div>
        </header>

        <div className="dashboard-content">
          <AdminSidebar active="veterinarios" />

          <main className="main-content">
            <section className="dashboard-section">
              <div className="vets-head">
                <h2>Gestión de Veterinarios</h2>
                <button className="btn-submit" onClick={() => setShowCrearModal(true)}>
                  + Agregar Veterinario
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="vets-search">
                <span aria-hidden>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre o especialidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    className="vets-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              {loading ? (
                <div className="loading">Cargando veterinarios...</div>
              ) : filteredVets.length === 0 ? (
                <div className="vets-empty">
                  <span className="vets-empty-icon" aria-hidden>🩺</span>
                  <p>No se encontraron resultados.</p>
                </div>
              ) : (
                <ul className="vets-list">
                  {filteredVets.map((vet) => (
                    <li key={vet.idUsuario}>
                      <button
                        type="button"
                        className="vet-row"
                        onClick={() =>
                          navigate(`/dashboard/admin/veterinarios/${vet.idVeterinario}`, {
                            state: { vet },
                          })
                        }
                      >
                        <span className="vet-row-avatar">{getIniciales(vet.nombreCompleto)}</span>
                        <span className="vet-row-info">
                          <span className="vet-row-nombre">{vet.nombreCompleto}</span>
                          <span className="vet-row-sub">
                            {formatEspecialidades(vet.especialidades)}
                          </span>
                        </span>
                        <span className={`status ${vet.estadoUsr === 1 ? 'active' : 'inactive'}`}>
                          {vet.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
