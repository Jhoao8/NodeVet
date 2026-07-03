import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../../api/client';
import { subirImagenCloudinary } from '../../services/cloudinaryService';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import type { Mascota } from '../../components/PetCard/PetCard.types';
import getCroppedImg from '../../utils/cropImage';
import '../../styles/Dashboard.css';
import '../../styles/DetalleMascota.css';

// Espejo web de la pantalla móvil EditarMascota: el tutor solo puede cambiar
// la foto, el nombre y el peso. Los datos médicos (especie, raza, sexo y
// fecha de nacimiento) quedan bloqueados y solo los modifica un veterinario.
export default function EditarMascota() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const nombreUsuario = useNombreUsuario();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mascotaInicial = (location.state as any)?.mascota as Mascota | undefined;

  const [mascota, setMascota] = useState<Mascota | null>(mascotaInicial ?? null);
  const [loading, setLoading] = useState(!mascotaInicial);

  const [nomMascota, setNomMascota] = useState(mascotaInicial?.nomMascota || '');
  const [peso, setPeso] = useState(mascotaInicial?.peso?.toString() || '');

  // Imagen nueva ya recortada, lista para subir a Cloudinary
  const [imagenCropped, setImagenCropped] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(
    mascotaInicial?.imagenMascota || null,
  );

  // Estados del modal de recorte
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

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
        if (encontrada) {
          setMascota(encontrada);
          setNomMascota(encontrada.nomMascota || '');
          setPeso(encontrada.peso?.toString() || '');
          setImagenPreview(encontrada.imagenMascota || null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, mascota, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir la misma imagen
    if (!file) return;
    setImageToCrop(URL.createObjectURL(file));
    setIsCropping(true);
  };

  const handleSaveCrop = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      const croppedImageFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedImageFile) {
        setImagenCropped(croppedImageFile);
        setImagenPreview(URL.createObjectURL(croppedImageFile));
      }
    } catch (e) {
      console.error(e);
      setError('Error al recortar la imagen');
    }
    setIsCropping(false);
    setImageToCrop(null);
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageToCrop(null);
  };

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mascota) return;
    if (!nomMascota.trim()) {
      setError('Por favor ingresa el nombre de la mascota.');
      return;
    }

    setGuardando(true);
    try {
      let imageUrl = mascota.imagenMascota;

      // Si el tutor eligió una foto nueva, la subimos antes de guardar
      if (imagenCropped) {
        const nuevaUrl = await subirImagenCloudinary(imagenCropped, 'mascotas');
        if (!nuevaUrl) {
          setError('No se pudo subir la nueva foto. Intenta nuevamente.');
          setGuardando(false);
          return;
        }
        imageUrl = nuevaUrl;
      }

      // Enviamos los datos originales y solo sobrescribimos lo editable,
      // porque el backend reemplaza todos los campos del DTO en el PUT.
      const payload = {
        ...mascota,
        nomMascota: nomMascota.trim(),
        peso: peso ? parseFloat(peso) : null,
        imagenMascota: imageUrl,
      };

      await api.put(`/v1/mascotas/${mascota.idMascota}`, payload);

      const mascotaActualizada: Mascota = {
        ...mascota,
        nomMascota: nomMascota.trim(),
        peso: peso ? parseFloat(peso) : undefined,
        imagenMascota: imageUrl,
      };

      alert('Datos actualizados correctamente.');
      navigate(`/dashboard/tutor/mascota/${mascota.idMascota}`, {
        state: { mascota: mascotaActualizada },
      });
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        (typeof data === 'string' && data) ||
          data?.error ||
          'No se pudo actualizar la mascota.',
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Modal/Overlay para recortar la foto */}
      {isCropping && imageToCrop && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-area">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="crop-modal-actions">
            <button type="button" className="btn-submit" onClick={handleSaveCrop}>
              Aplicar Recorte
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancelCrop}>
              Cancelar
            </button>
          </div>
        </div>
      )}

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
            <button
              className="mascota-back"
              onClick={() =>
                navigate(`/dashboard/tutor/mascota/${id}`, {
                  state: mascota ? { mascota } : undefined,
                })
              }
            >
              ← Volver al detalle
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
              <section className="dashboard-section">
                <h3>Editar mascota</h3>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleGuardar} className="editar-mascota-form">
                  {/* ─── Foto ─── */}
                  <div className="editar-foto-wrap">
                    <span className="editar-foto-label">Cambiar foto de la Mascota</span>
                    <button
                      type="button"
                      className="editar-foto-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={guardando}
                      title="Cambiar foto"
                    >
                      {imagenPreview ? (
                        <img src={imagenPreview} alt={`Foto de ${mascota.nomMascota}`} />
                      ) : (
                        <span className="editar-foto-placeholder">📷 Seleccionar foto</span>
                      )}
                      <span className="editar-foto-overlay">📷 Cambiar</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* ─── Campos editables ─── */}
                  <div className="form-grid">
                    <div className="form-field span-2">
                      <label htmlFor="mascota-nombre">Nombre de la Mascota</label>
                      <input
                        id="mascota-nombre"
                        type="text"
                        value={nomMascota}
                        onChange={(e) => setNomMascota(e.target.value)}
                        disabled={guardando}
                        required
                      />
                    </div>
                    <div className="form-field span-2">
                      <label htmlFor="mascota-peso">Peso Actual (Kg)</label>
                      <input
                        id="mascota-peso"
                        type="number"
                        step="0.01"
                        min="0"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        disabled={guardando}
                      />
                    </div>
                  </div>

                  {/* ─── Información bloqueada (misma política que el móvil) ─── */}
                  <div className="editar-info-bloqueada">
                    <div className="editar-info-head">
                      <span aria-hidden>ℹ️</span>
                      <strong>Información Bloqueada</strong>
                    </div>
                    <p>
                      Por seguridad, los datos médicos como especie, raza, sexo y fecha
                      de nacimiento solo pueden ser modificados por un veterinario
                      autorizado.
                    </p>
                  </div>

                  <div className="editar-form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() =>
                        navigate(`/dashboard/tutor/mascota/${id}`, {
                          state: { mascota },
                        })
                      }
                      disabled={guardando}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit" disabled={guardando}>
                      {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
