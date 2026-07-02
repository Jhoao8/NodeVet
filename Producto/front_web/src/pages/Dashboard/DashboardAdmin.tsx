import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/Dashboard.css';
import EditarUsuarioForm from '../../components/forms/EditarUsuarioForm';
import AdminSidebar from '../../components/AdminSidebar';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import { getUserInfoFromToken } from '../../utils/authUtils';
import UserMenu from '../../components/UserMenu';

interface Usuario {
  idUsuario: string;
  nombreCompleto: string;
  correoUsr: string;
  telefonoUsr: string;
  estadoUsr: number;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const [correoAdmin] = useState<string>(() => {
    const token = localStorage.getItem('token');
    return (token && getUserInfoFromToken(token)?.username) || '';
  });

  const esCuentaPropia = (usuario: Usuario): boolean =>
    !!correoAdmin && usuario.correoUsr?.toLowerCase() === correoAdmin.toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchUsers = async () => {

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

  const handleEditSuccess = () => {
    setEditingUser(null);
    fetchUsers();
  };

  const handleDelete = async (usuario: Usuario) => {
    // Salvaguarda: aunque el botón está deshabilitado, evitamos el auto-borrado por si acaso.
    if (esCuentaPropia(usuario)) {
      setActionError('No puedes eliminar tu propia cuenta de administrador.');
      return;
    }

    const confirmar = window.confirm(`¿Eliminar al usuario ${usuario.nombreCompleto}?`);
    if (!confirmar) return;

    setActionError('');
    setDeletingId(usuario.idUsuario);
    try {
      await api.delete(`/v1/usuarios/${usuario.idUsuario}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      setActionError(`No se pudo desactivar la cuenta de ${usuario.nombreCompleto}.`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {editingUser && (
        <EditarUsuarioForm
          usuario={editingUser}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingUser(null)}
        />
      )}
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
          <div className="user-section">
            <span className="notification">🔔</span>
            <UserMenu nombre={nombreUsuario} onLogout={handleLogout} />
          </div>
        </header>

        <div className="dashboard-content">
          <AdminSidebar active="usuarios" />

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
                    {actionError && <div className="error-message">{actionError}</div>}
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>
                              No hay usuarios registrados.
                            </td>
                          </tr>
                        ) : (
                          usuarios.map((usuario) => (
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
                              <td>
                                <div className="table-actions">
                                  <button
                                    className="btn-row edit"
                                    onClick={() => setEditingUser(usuario)}
                                    disabled={deletingId === usuario.idUsuario}
                                  >
                                    Modificar
                                  </button>
                                  <button
                                    className="btn-row danger"
                                    onClick={() => handleDelete(usuario)}
                                    disabled={deletingId === usuario.idUsuario || esCuentaPropia(usuario)}
                                    title={esCuentaPropia(usuario) ? 'No puedes eliminar tu propia cuenta' : undefined}
                                  >
                                    {deletingId === usuario.idUsuario ? 'Eliminando...' : 'Eliminar'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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