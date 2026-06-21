import api from '../api/client';

// Acceso denegado = 403 directo, o 403 enmascarado como 401 (el backend reenvía a /error
// y, al ser stateless, pierde la autenticación). En ambos casos el usuario está
// autenticado pero no tiene ese rol: seguimos probando el siguiente.
const esAccesoDenegado = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 403 || (status === 401 && error?.response?.data?.path === '/error');
};

/**
 * Detecta el rol del usuario probando endpoints protegidos por rol en el backend.
 * No hay endpoint que devuelva el rol directamente, así que lo deducimos por permisos:
 *   - GET /v1/usuarios        -> exclusivo de ADMIN
 *   - GET /v1/especialidades  -> ADMIN o VET (el admin ya quedó descartado)
 *   - en cualquier otro caso  -> TUTOR
 * Requiere que el token ya esté en localStorage (Login lo guarda antes de llamar).
 */
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

/**
 * Devuelve la ruta del dashboard correspondiente al rol guardado en localStorage.
 * Evita enviar a un admin/veterinario al panel de tutor: ese panel consulta
 * endpoints exclusivos de tutor (p.ej. /v1/mascotas/listar) y un 403 (enmascarado
 * como 401 por el backend) provocaría el cierre de sesión indebido.
 */
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
