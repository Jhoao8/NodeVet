/**
 * Obtiene el rol del usuario basándose en el email
 * Si es admin conocido, devuelve ADMIN
 * Si no, devuelve TUTOR por defecto
 * 
 * NOTA: Una solución mejor sería que el backend incluya el rol en la respuesta de login
 */
export const getUserRole = async (email: string): Promise<'ADMIN' | 'VETERINARIO' | 'TUTOR'> => {
  try {
    console.log('Detectando rol del usuario:', email);

    // Hardcoded: si es el admin conocido, es admin
    // En un sistema real, esto debería venir del backend
    if (email === 'admin@nodevet.com') {
      console.log('Email reconocido como admin');
      return 'ADMIN';
    }

    // Por defecto, es tutor
    console.log('Usuario es TUTOR (por defecto)');
    return 'TUTOR';

  } catch (error: any) {
    console.error('Error al obtener rol del usuario:', error);
    return 'TUTOR'; // Default role
  }
};

/**
 * Obtiene la información del usuario desde el token JWT
 */
export const getUserInfoFromToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub || '',
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};
