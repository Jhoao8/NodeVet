export const subirImagenCloudinary = async (file: File, tipo: 'mascotas' | 'usuarios'): Promise<string | null> => {
  const data = new FormData();
  data.append('file', file);
  
  const nombrePreset = tipo === 'mascotas' ? 'mascotas_preset' : 'usuarios_preset';
  data.append('upload_preset', nombrePreset);

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dkryb2g4m/image/upload', {
      method: 'POST',
      body: data,
    });
    
    if (!response.ok) {
        throw new Error('Error al subir la imagen a Cloudinary');
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return null;
  }
};
