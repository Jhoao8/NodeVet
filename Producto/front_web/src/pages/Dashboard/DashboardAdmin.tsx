import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/Dashboard.css';
import RegistrarVeterinarioForm from '../../components/forms/RegistrarVeterinarioForm';

interface Usuario {
  idUsuario: string;
  nombreCompleto: string;
  correoUsr: string;
  telefonoUsr: string;
  estadoUsr: number;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ultimoVet, setUltimoVet] = useState<{ idVeterinario?: number; nombreCompleto?: string } | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchUsers = async () => {
    // No need to set loading here as it's for the whole page
    try {
      const usuariosData = await api.get('/v1/usuarios');
      setUsuarios(usuariosData.data);
    } catch (error) {
      console.error('Error al cargar lista de usuarios:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const handleSuccess = (vet?: { idVeterinario?: number; nombreCompleto?: string }) => {
    setShowModal(false);
    fetchUsers(); // Refresh user list
    if (vet?.idVeterinario) {
      setUltimoVet({ idVeterinario: vet.idVeterinario, nombreCompleto: vet.nombreCompleto });
      localStorage.setItem('ultimoVetIdVet', String(vet.idVeterinario));
    }
  };

  return (
    <>
      {showModal && (
        <RegistrarVeterinarioForm
          onSuccess={handleSuccess}
          onCancel={() => setShowModal(false)}
        />
      )}
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
          <div className="user-section">
            <span className="notification">🔔</span>
            <span className="username">Admin</span>
            <button className="user-menu" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Sidebar */}
          <aside className="sidebar">
            <h3>Menú</h3>
            <nav className="sidebar-nav">
              <button className="nav-item active" onClick={() => navigate('/dashboard/admin')}>👥 Usuarios</button>
              <button className="nav-item" onClick={() => navigate('/dashboard/admin/agenda')}>🗓️ Generar Agenda</button>
              <button className="nav-item" onClick={() => navigate('/dashboard/admin/precio')}>💲 Valor de citas</button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {loading ? (
              <div className="loading">Cargando...</div>
            ) : (
              <>
                <section className="dashboard-section">
                  <h2>Dashboard</h2>
                </section>

                <div className="admin-grid">
                  <section className="dashboard-section">
                    <h3>Usuarios</h3>
                    {ultimoVet?.idVeterinario && (
                      <div
                        className="error-message"
                        style={{ background: '#e6f4ea', color: '#1e4620', border: '1px solid #b7e1c4' }}
                      >
                        Veterinario creado: {ultimoVet.nombreCompleto} — <strong>ID de veterinario: {ultimoVet.idVeterinario}</strong>. Úsalo en "Generar Agenda".
                      </div>
                    )}
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario) => (
                          <tr key={usuario.idUsuario}>
                            <td>{usuario.idUsuario}</td>
                            <td>{usuario.nombreCompleto}</td>
                            <td>{usuario.correoUsr}</td>
                            <td>{usuario.telefonoUsr}</td>
                            <td>
                              <span className={`status ${usuario.estadoUsr === 1 ? 'active' : 'inactive'}`}>
                                {usuario.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="action-buttons">
                      <button className="btn-secondary" onClick={() => setShowModal(true)}>Crear Médico</button>
                      <button className="btn-secondary">Listar</button>
                      <button className="btn-secondary">Modificar</button>
                      <button className="btn-secondary">Eliminar</button>
                    </div>
                  </section>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}