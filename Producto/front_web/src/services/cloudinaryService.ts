// Sube un archivo de consulta (imagen o PDF) a Cloudinary y devuelve su URL pública.
// Usa /auto/upload para aceptar tanto imágenes como PDFs, con el preset sin firma existente.
export const subirArchivoCloudinary = async (file: File): Promise<string | null> => {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'mascotas_preset'); // preset unsigned ya existente en la cuenta

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dkryb2g4m/auto/upload', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      throw new Error('Error al subir el archivo a Cloudinary');
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return null;
  }
};

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
