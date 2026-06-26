import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { subirImagenCloudinary } from '../../services/cloudinaryService';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';
import '../../styles/Perfil.css';

// Datos tal como los entrega el backend en GET /v1/usuarios/perfil
interface PerfilUsuario {
  nombreCompleto: string;
  correoUsr: string;
  telefonoUsr: string;
  fotoUsr?: string;
}

// Separa "Juan Pérez Soto" en { nombre: "Juan", apellido: "Pérez Soto" }
// (misma lógica que usa EditarUsuarioForm para el panel de administración)
function separarNombre(nombreCompleto: string): { nombre: string; apellido: string } {
  const partes = (nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { nombre: '', apellido: '' };
  return { nombre: partes[0], apellido: partes.slice(1).join(' ') };
}

const ROLES_LABEL: Record<string, string> = {
  TUTOR: 'Tutor',
  VETERINARIO: 'Veterinario',
  ADMIN: 'Administrador',
};

export default function PerfilTutor() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Campos del formulario de edición
  const [nombreUsr, setNombreUsr] = useState('');
  const [apellidoUsr, setApellidoUsr] = useState('');
  const [correoUsr, setCorreoUsr] = useState('');
  const [telefonoUsr, setTelefonoUsr] = useState('');

  const rolLabel = ROLES_LABEL[localStorage.getItem('userRole') || ''] || 'Tutor';

  // Carga el perfil y precarga el formulario con los datos ya separados
  const cargarPerfil = (data: PerfilUsuario) => {
    setPerfil(data);
    const { nombre, apellido } = separarNombre(data.nombreCompleto);
    setNombreUsr(nombre);
    setApellidoUsr(apellido);
    setCorreoUsr(data.correoUsr || '');
    setTelefonoUsr(data.telefonoUsr || '');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    let cancelado = false;
    api
      .get('/v1/usuarios/perfil')
      .then((resp) => {
        if (!cancelado) cargarPerfil(resp.data);
      })
      .catch((err) => {
        // El interceptor de client.ts ya redirige a /login en 401
        if (err.response?.status !== 401) {
          setError('No se pudieron cargar los datos del perfil.');
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // ─── Cambio de foto de perfil ───
  const handleFotoSeleccionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir la misma imagen
    if (!file) return;

    setError('');
    setExito('');
    setSubiendoFoto(true);
    try {
      const imageUrl = await subirImagenCloudinary(file, 'usuarios');
      if (!imageUrl) {
        setError('No se pudo subir la imagen. Intenta nuevamente.');
        return;
      }

      await api.put('/v1/usuarios/perfil/foto', { fotoUsr: imageUrl });
      setPerfil((prev) => (prev ? { ...prev, fotoUsr: imageUrl } : prev));
      setExito('Tu foto de perfil se actualizó correctamente.');
    } catch {
      setError('No se pudo guardar la foto en tu perfil.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  // ─── Guardar datos del perfil ───
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nombreUsr.trim() || !apellidoUsr.trim()) {
      setError('El nombre y el apellido son obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoUsr.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setGuardando(true);
    try {
      await api.put('/v1/usuarios/perfil', {
        nombreUsr: nombreUsr.trim(),
        apellidoUsr: apellidoUsr.trim(),
        correoUsr: correoUsr.trim(),
        telefonoUsr: telefonoUsr.trim(),
      });

      // Reflejamos los cambios en la vista sin recargar
      setPerfil((prev) =>
        prev
          ? {
              ...prev,
              nombreCompleto: `${nombreUsr.trim()} ${apellidoUsr.trim()}`,
              correoUsr: correoUsr.trim(),
              telefonoUsr: telefonoUsr.trim(),
            }
          : prev,
      );
      setEditando(false);
      setExito('Perfil actualizado correctamente.');
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        (typeof data === 'string' && data) ||
          data?.error ||
          'No se pudo actualizar el perfil. Intenta de nuevo.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarEdicion = () => {
    // Restauramos el formulario a los valores actuales del perfil
    if (perfil) cargarPerfil(perfil);
    setEditando(false);
    setError('');
  };

  const { nombre: nombreVista, apellido: apellidoVista } = separarNombre(
    perfil?.nombreCompleto || '',
  );
  const iniciales =
    `${nombreVista.charAt(0)}${apellidoVista.charAt(0)}`.toUpperCase() || '👤';

  return (
    <div className="dashboard-container">
      {/* Header */}
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
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item active">👤 Perfil</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor')}>🏠 Home</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor/citas')}>📅 Citas</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/tutor', { state: { scrollTo: 'controles' } })}>🏥 Control Médico</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="perfil-wrap">
            {error && <div className="error-message">{error}</div>}
            {exito && <div className="success-message">{exito}</div>}

            {loading ? (
              <div className="perfil-card">
                <div className="loading">Cargando perfil...</div>
              </div>
            ) : (
              <>
                {/* ─── Hero / encabezado de identidad ─── */}
                <section className="perfil-hero">
                  <div className="perfil-avatar-wrap">
                    <button
                      type="button"
                      className="perfil-avatar"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={subiendoFoto}
                      title="Cambiar foto de perfil"
                    >
                      {perfil?.fotoUsr ? (
                        <img src={perfil.fotoUsr} alt="Foto de perfil" />
                      ) : (
                        <span className="perfil-avatar-iniciales">{iniciales}</span>
                      )}

                      <span className="perfil-avatar-overlay">
                        {subiendoFoto ? 'Subiendo…' : '📷 Cambiar'}
                      </span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={handleFotoSeleccionada}
                    />
                  </div>

                  <div className="perfil-hero-info">
                    <h1 className="perfil-nombre">
                      {perfil?.nombreCompleto || 'Sin nombre'}
                    </h1>
                    <span className="perfil-role-badge">{rolLabel}</span>
                    <p className="perfil-hero-email">
                      <span aria-hidden>📧</span> {perfil?.correoUsr || 'Sin correo'}
                    </p>
                  </div>

                  {!editando && (
                    <div className="perfil-hero-actions">
                      <button className="perfil-btn-edit" onClick={() => setEditando(true)}>
                        ✎ Editar perfil
                      </button>
                    </div>
                  )}
                </section>

                {/* ─── Información personal ─── */}
                <section className="perfil-card">
                  <div className="perfil-card-head">
                    <h2>Información personal</h2>
                    {editando && <span className="perfil-card-tag">Editando</span>}
                  </div>

                  {editando ? (
                    <form onSubmit={handleGuardar} className="perfil-form">
                      <div className="form-grid">
                        <div className="form-field">
                          <label htmlFor="perfil-nombre">Nombre</label>
                          <input
                            id="perfil-nombre"
                            type="text"
                            value={nombreUsr}
                            onChange={(e) => setNombreUsr(e.target.value)}
                            disabled={guardando}
                            required
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="perfil-apellido">Apellido</label>
                          <input
                            id="perfil-apellido"
                            type="text"
                            value={apellidoUsr}
                            onChange={(e) => setApellidoUsr(e.target.value)}
                            disabled={guardando}
                            required
                          />
                        </div>
                        <div className="form-field span-2">
                          <label htmlFor="perfil-correo">Correo electrónico</label>
                          <input
                            id="perfil-correo"
                            type="email"
                            value={correoUsr}
                            onChange={(e) => setCorreoUsr(e.target.value)}
                            disabled={guardando}
                            required
                          />
                        </div>
                        <div className="form-field span-2">
                          <label htmlFor="perfil-telefono">
                            Teléfono <span className="optional-tag">(opcional)</span>
                          </label>
                          <input
                            id="perfil-telefono"
                            type="text"
                            placeholder="+56 9 1234 5678"
                            value={telefonoUsr}
                            onChange={(e) => setTelefonoUsr(e.target.value)}
                            disabled={guardando}
                          />
                        </div>
                      </div>

                      <div className="perfil-form-actions">
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={handleCancelarEdicion}
                          disabled={guardando}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={guardando}>
                          {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <dl className="perfil-info-grid">
                      <div className="perfil-info-item">
                        <dt>Nombre</dt>
                        <dd>{nombreVista || 'No registrado'}</dd>
                      </div>
                      <div className="perfil-info-item">
                        <dt>Apellido</dt>
                        <dd>{apellidoVista || 'No registrado'}</dd>
                      </div>
                      <div className="perfil-info-item">
                        <dt>Correo electrónico</dt>
                        <dd>{perfil?.correoUsr || 'No registrado'}</dd>
                      </div>
                      <div className="perfil-info-item">
                        <dt>Teléfono</dt>
                        <dd>{perfil?.telefonoUsr || 'No registrado'}</dd>
                      </div>
                    </dl>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
