import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Interceptor para agregar el token JWT a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    // Si la respuesta incluye un nuevo token en los headers (como en la app móvil)
    const newToken = response.headers['new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // El backend reescribe los 403 (usuario autenticado pero SIN permisos) como 401:
    // al denegar el acceso reenvía la petición a /error y, como la sesión es stateless,
    // en ese reenvío se pierde la autenticación. Lo detectamos por el "path": "/error"
    // del cuerpo. Eso NO es un token expirado, así que no debemos cerrar la sesión.
    const esForbiddenEnmascarado =
      status === 401 && error.response?.data?.path === '/error';

    if (status === 401 && !esForbiddenEnmascarado) {
      // 401 real: token ausente, inválido o expirado.
      console.error('Error 401 - Token inválido o expirado');
      localStorage.removeItem('token');
      // Redirigir al login si el token expira para evitar que la app quede en estado inconsistente
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
