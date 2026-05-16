import { useState, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../api/client';
import { subirImagenCloudinary } from '../services/cloudinaryService';
import type { Mascota } from '../components/PetCard/PetCard.types';
import getCroppedImg from '../utils/cropImage';
import '../styles/Auth.css';

export default function AgregarMascota() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extraer estado de navegación si venimos de "Editar"
  const isEditing = location.state?.isEditing || false;
  const mascotaToEdit: Mascota | undefined = location.state?.mascota;

  const [nombre, setNombre] = useState(mascotaToEdit?.nomMascota || '');
  const [tipo, setTipo] = useState(mascotaToEdit?.especie || '');
  const [raza, setRaza] = useState(mascotaToEdit?.raza || '');
  const [sexo, setSexo] = useState<number>(mascotaToEdit?.sexo ?? 1);
  const [fecNac, setFecNac] = useState(mascotaToEdit?.fecNac || '');
  const [estFecNac, setEstFecNac] = useState<number>(mascotaToEdit?.estFecNac ?? 0);
  const [peso, setPeso] = useState<string>(mascotaToEdit?.peso?.toString() || '');
  
  // Imagen final lista para subir a cloudinary (File u object)
  const [imagenCropped, setImagenCropped] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(mascotaToEdit?.imagenMascota || null);
  
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

    if (!nombre || !tipo) {
      setError('Por favor completa todos los campos obligatorios.');
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
        estFecNac: estFecNac,
        peso: peso ? parseFloat(peso) : null,
        // Si hay nueva imagen recortada usamos la nueva URL, sino mantenemos la existente (o undefined)
        imagenMascota: imageUrl || mascotaToEdit?.imagenMascota || undefined
      };

      if (isEditing && mascotaToEdit?.idMascota) {
        await api.put(`/v1/mascotas/actualizar/${mascotaToEdit.idMascota}`, payload);
        alert('Mascota actualizada correctamente');
      } else {
        await api.post('/v1/mascotas/registrar', payload);
        alert('Mascota agregada correctamente');
      }
      
      navigate('/dashboard/tutor');
    } catch (err: any) {
      setError(err.response?.data?.error || `Error al ${isEditing ? 'actualizar' : 'agregar'} la mascota`);
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
        <h1>{isEditing ? 'Editar Mascota' : 'Agregar Mascota'}</h1>
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
          <input
            type="text"
            placeholder="Especie (Ej: Perro, Gato) *"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Raza"
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
          />
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
                id="estFecNac"
                checked={estFecNac === 1}
                onChange={(e) => setEstFecNac(e.target.checked ? 1 : 0)}
                style={{ width: 'auto', margin: 0 }}
              />
              <label htmlFor="estFecNac" style={{ fontSize: '14px', margin: 0, fontWeight: 'normal' }}>Fecha aproximada</label>
            </div>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Peso (kg)"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
          <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Agregar Mascota')}
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