// Esta función ahora recibe un segundo parámetro 'tipo'
const subirImagenCloudinary = async (uri: string, tipo: 'mascotas' | 'usuarios') => {
  const data = new FormData();
  
  data.append('file', {
    uri: uri,
    type: 'image/jpeg',
    name: 'archivo.jpg',
  } as any);
  
  // Seleccionamos el preset según lo que estemos subiendo
  const nombrePreset = tipo === 'mascotas' ? 'mascotas_preset' : 'usuarios_preset';
  data.append('upload_preset', nombrePreset);

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dkryb2g4m/image/upload', {
      method: 'POST',
      body: data,
    });
    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return null;
  }
};