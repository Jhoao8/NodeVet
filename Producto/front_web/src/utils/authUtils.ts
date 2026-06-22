import api from '../api/client';

const esAccesoDenegado = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 403 || (status === 401 && error?.response?.data?.path === '/error');
};

export const getUserRole = async (_email?: string): Promise<'ADMIN' | 'VETERINARIO' | 'TUTOR'> => {
  // 1. ¿Administrador?
  try {
    await api.get('/v1/usuarios');
    return 'ADMIN';
  } catch (error) {
    if (!esAccesoDenegado(error)) {
      console.error('Error inesperado detectando rol (admin):', error);
    }
  }

  // 2. ¿Veterinario?
  try {
    await api.get('/v1/especialidades');
    return 'VETERINARIO';
  } catch (error) {
    if (!esAccesoDenegado(error)) {
      console.error('Error inesperado detectando rol (veterinario):', error);
    }
  }

  // 3. Por defecto, tutor.
  return 'TUTOR';
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

export const getDashboardPath = (): string => {
  const role = localStorage.getItem('userRole');
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'VETERINARIO':
      return '/dashboard/medico';
    default:
      return '/dashboard/tutor';
  }
};
