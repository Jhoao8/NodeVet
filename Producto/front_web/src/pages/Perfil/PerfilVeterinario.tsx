import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { subirImagenCloudinary } from '../../services/cloudinaryService';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';
import '../../styles/Perfil.css';

// Espejo web de VetPerfilScreen móvil: foto de perfil, datos de la cuenta,
// cambio de contraseña y cierre de sesión del veterinario.

interface PerfilUsuario {
  nombreCompleto: string;
  correoUsr: string;
  telefonoUsr: string;
  fotoUsr?: string;
}

export default function PerfilVeterinario() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Cambio de contraseña (mismo modal y reglas que el móvil)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');

  const validacionesNuevaPassword = [
    { id: 'min', mensaje: 'Mínimo 6 caracteres', cumple: nuevaPassword.length >= 6 },
    { id: 'upper', mensaje: 'Al menos 1 mayúscula', cumple: /[A-Z]/.test(nuevaPassword) },
    { id: 'lower', mensaje: 'Al menos 1 minúscula', cumple: /[a-z]/.test(nuevaPassword) },
    {
      id: 'special',
      mensaje: 'Al menos 1 carácter especial (!@#$%...)',
      cumple: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(nuevaPassword),
    },
  ];
  const validacionesPendientes = validacionesNuevaPassword.filter((v) => !v.cumple);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    let cancelado = false;
    api
      .get('/v1/usuarios/perfil')
      .then((resp) => {
        if (!cancelado) setPerfil(resp.data);
      })
      .catch((err) => {
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

  const handleCerrarSesion = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      handleLogout();
    }
  };

  // ─── Cambio de foto de perfil ───
  const handleFotoSeleccionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!window.confirm('¿Deseas establecer esta imagen como tu nueva foto de perfil?')) {
      return;
    }

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

  // ─── Cambio de contraseña ───
  const abrirModalCambioPassword = () => {
    setPasswordActual('');
    setNuevaPassword('');
    setConfirmPassword('');
    setErrorPassword('');
    setShowPasswordModal(true);
  };

  const cambiarPassword = async () => {
    setErrorPassword('');
    if (!passwordActual || !nuevaPassword || !confirmPassword) {
      setErrorPassword('Debes ingresar contraseña actual, nueva y confirmación.');
      return;
    }
    if (validacionesPendientes.length > 0) {
      setErrorPassword('La nueva contraseña no cumple todas las reglas requeridas.');
      return;
    }
    if (nuevaPassword !== confirmPassword) {
      setErrorPassword('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setCambiandoPassword(true);
    try {
      await api.put('/v1/usuarios/perfil/password', { passwordActual, nuevaPassword });
      setShowPasswordModal(false);
      setExito('Tu contraseña se cambió correctamente.');
    } catch (err: any) {
      const data = err?.response?.data;
      setErrorPassword(
        (typeof data === 'string' && data) || 'No se pudo cambiar la contraseña.',
      );
    } finally {
      setCambiandoPassword(false);
    }
  };

  const iniciales = (perfil?.nombreCompleto || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase() || '👤';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <nav className="nav-tabs">
          <button className="nav-tab" onClick={() => navigate('/dashboard/medico')}>
            ⚕️ Mi Agenda
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
            <button className="nav-item active">👤 Perfil</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/medico')}>🏠 Agenda del Día</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/medico/atencion')}>🩺 Atender consulta</button>
          </nav>
        </aside>

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
                {/* ─── Hero de identidad ─── */}
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
                    <h1 className="perfil-nombre">{perfil?.nombreCompleto || 'Sin nombre'}</h1>
                    <span className="perfil-role-badge">Veterinario</span>
                    <p className="perfil-hero-email">
                      <span aria-hidden>📧</span> {perfil?.correoUsr || 'Sin correo'}
                    </p>
                  </div>
                </section>

                {/* ─── Información de la cuenta ─── */}
                <section className="perfil-card">
                  <div className="perfil-card-head">
                    <h2>Información de la cuenta</h2>
                  </div>
                  <dl className="perfil-info-grid">
                    <div className="perfil-info-item">
                      <dt>Nombre completo</dt>
                      <dd>{perfil?.nombreCompleto || 'No registrado'}</dd>
                    </div>
                    <div className="perfil-info-item">
                      <dt>Teléfono</dt>
                      <dd>{perfil?.telefonoUsr || 'No registrado'}</dd>
                    </div>
                    <div className="perfil-info-item">
                      <dt>Correo institucional</dt>
                      <dd>{perfil?.correoUsr || 'No registrado'}</dd>
                    </div>
                  </dl>
                </section>

                {/* ─── Cuenta ─── */}
                <section className="perfil-card">
                  <div className="perfil-card-head">
                    <h2>Cuenta</h2>
                  </div>

                  <div className="perfil-menu">
                    <button type="button" className="perfil-menu-btn" onClick={abrirModalCambioPassword}>
                      Cambiar contraseña
                    </button>
                  </div>

                  <button type="button" className="perfil-logout-btn" onClick={handleCerrarSesion}>
                    Cerrar Sesión
                  </button>
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── Modal: cambiar contraseña ─── */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => !cambiandoPassword && setShowPasswordModal(false)}
        >
          <div className="modal-content jornada-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar contraseña</h2>
              <p>Ingresa tu contraseña actual y define una nueva.</p>
            </div>

            <div className="modal-body">
              {errorPassword && <div className="error-message">{errorPassword}</div>}

              <div className="form-grid">
                <div className="form-field span-2">
                  <label htmlFor="vet-pass-actual">Contraseña actual</label>
                  <input
                    id="vet-pass-actual"
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    disabled={cambiandoPassword}
                  />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="vet-pass-nueva">Nueva contraseña</label>
                  <input
                    id="vet-pass-nueva"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    disabled={cambiandoPassword}
                  />
                  {nuevaPassword.length > 0 && validacionesPendientes.length > 0 && (
                    <div style={{ marginTop: '6px' }}>
                      {validacionesPendientes.map((v) => (
                        <span key={v.id} className="field-error">{v.mensaje}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-field span-2">
                  <label htmlFor="vet-pass-confirmar">Confirmar contraseña</label>
                  <input
                    id="vet-pass-confirmar"
                    type="password"
                    placeholder="Repite la nueva contraseña"
                    className={
                      confirmPassword.length > 0 && confirmPassword !== nuevaPassword
                        ? 'input-error'
                        : ''
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={cambiandoPassword}
                  />
                  {confirmPassword.length > 0 && confirmPassword !== nuevaPassword && (
                    <span className="field-error">Las contraseñas no coinciden</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowPasswordModal(false)}
                disabled={cambiandoPassword}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={cambiarPassword}
                disabled={cambiandoPassword}
              >
                {cambiandoPassword ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
