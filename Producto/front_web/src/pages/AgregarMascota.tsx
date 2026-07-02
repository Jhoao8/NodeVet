import { useState, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../api/client';
import { subirImagenCloudinary } from '../services/cloudinaryService';
import getCroppedImg from '../utils/cropImage';
import { PET_DATA } from '../utils/petData';
import type { EspecieMascota } from '../utils/petData';
import '../styles/Auth.css';

const ESPECIES = Object.keys(PET_DATA) as EspecieMascota[];

// La edición de mascotas vive en /dashboard/tutor/mascota/:id/editar
// (EditarMascota.tsx); esta página solo registra mascotas nuevas.
export default function AgregarMascota() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<number>(1);
  const [fecNac, setFecNac] = useState('');
  const [fecNacEst, setFecNacEst] = useState<number>(0);
  const [peso, setPeso] = useState<string>('');

  // Imagen final lista para subir a cloudinary (File u object)
  const [imagenCropped, setImagenCropped] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  
  // Estados para el modal de Cropper
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setIsCropping(true); // Abrir el "modal" de recorte
      // Limpiar input por si seleccionan la misma
      e.target.value = '';
    }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !tipo || !peso) {
      setError('Por favor completa el nombre, especie y peso.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imagenCropped) {
        imageUrl = await subirImagenCloudinary(imagenCropped, 'mascotas');
        if (!imageUrl) {
          setError('Error al subir la imagen. Intenta nuevamente.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        nomMascota: nombre,
        especie: tipo,
        raza: raza,
        sexo: sexo,
        fecNac: fecNac ? fecNac : null,
        fecNacEst: fecNacEst,
        peso: peso ? parseFloat(peso) : null,
        imagenMascota: imageUrl || undefined
      };

      await api.post('/v1/mascotas', payload);
      alert('Mascota agregada correctamente');

      navigate('/dashboard/tutor');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar la mascota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Modal/Overlay para Cropper */}
      {isCropping && imageToCrop && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '90%', height: '60%', backgroundColor: '#333' }}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1} // 1:1 para avatar/círculo
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={handleSaveCrop}>Aplicar Recorte</button>
            <button className="btn-secondary" style={{ backgroundColor: '#ccc', color: '#333', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }} onClick={handleCancelCrop}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="auth-box">
        <h1>Agregar Mascota</h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="image-upload-container" style={{ textAlign: 'center', marginBottom: '15px' }}>
             {imagenPreview ? (
               <div style={{ position: 'relative', display: 'inline-block' }}>
                 <img 
                   src={imagenPreview} 
                   alt="Vista previa" 
                   style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid #e0e0e0' }} 
                   onClick={() => fileInputRef.current?.click()} 
                 />
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   style={{
                     position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white',
                     borderRadius: '50%', width: '28px', height: '28px', display: 'flex', 
                     alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px'
                   }}
                   title="Cambiar foto"
                 >
                   ✎
                 </div>
               </div>
             ) : (
               <div 
                 style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', cursor: 'pointer', border: '2px dashed #ccc' }}
                 onClick={() => fileInputRef.current?.click()}
               >
                 <span style={{ fontSize: '12px', color: '#666' }}>Subir foto</span>
               </div>
             )}
             <input
               type="file"
               ref={fileInputRef}
               style={{ display: 'none' }}
               accept="image/jpeg, image/png, image/jpg"
               onChange={handleImageChange}
             />
          </div>
          <input
            type="text"
            placeholder="Nombre de la mascota *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
            <label style={{ width: '100px', textAlign: 'left', fontWeight: 'bold' }}>Especie: *</label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                // Al cambiar la especie se limpia la raza (igual que el móvil)
                setRaza('');
              }}
              required
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#333' }}
            >
              <option value="">Seleccionar...</option>
              {ESPECIES.map((especie) => (
                <option key={especie} value={especie}>{especie}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
            <label style={{ width: '100px', textAlign: 'left', fontWeight: 'bold' }}>Raza:</label>
            <select
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
              disabled={!tipo}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: tipo ? '#f9f9f9' : '#F3F4F6', color: '#333' }}
            >
              <option value="">{tipo ? 'Seleccionar...' : 'Elija especie'}</option>
              {tipo &&
                PET_DATA[tipo as EspecieMascota]?.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
            <label style={{ width: '100px', textAlign: 'left', fontWeight: 'bold' }}>Sexo:</label>
            <select 
              value={sexo} 
              onChange={(e) => setSexo(Number(e.target.value))} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#333' }}
            >
              <option value={1}>Macho</option>
              <option value={0}>Hembra</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento:</label>
            <input
              type="date"
              value={fecNac}
              onChange={(e) => setFecNac(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
              <input
                type="checkbox"
                id="fecNacEst"
                checked={fecNacEst === 1}
                onChange={(e) => setFecNacEst(e.target.checked ? 1 : 0)}
                style={{ width: 'auto', margin: 0 }}
              />
              <label htmlFor="fecNacEst" style={{ fontSize: '14px', margin: 0, fontWeight: 'normal' }}>Fecha aproximada</label>
            </div>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Peso (kg) *"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Guardando...' : 'Agregar Mascota'}
          </button>
        </form>

        <button type="button" className="btn-link" onClick={() => navigate('/dashboard/tutor')}>
          Volver al dashboard
        </button>
        <button type="button" className="btn-link" onClick={() => navigate('/home')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}