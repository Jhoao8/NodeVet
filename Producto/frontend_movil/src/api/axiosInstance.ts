import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVELOPER_IP = process.env.EXPO_PUBLIC_DEVELOPER_IP || "localhost";

// Crear CancelToken para cancelar peticiones pendientes
let cancelSource = axios.CancelToken.source();

const api = axios.create({
    baseURL: `http://${DEVELOPER_IP}:8080/api`, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    cancelToken: cancelSource.token,
});

// Función para cancelar todas las peticiones pendientes (se llamará al logout)
export const cancelAllRequests = () => {
    cancelSource.cancel('Peticiones canceladas al cerrar sesión');
    cancelSource = axios.CancelToken.source();
    api.defaults.cancelToken = cancelSource.token;
};

// Interceptor de peticion
api.interceptors.request.use(
    async (config) => {
        try {
            // Buscamos el token
            const token = await AsyncStorage.getItem('userToken');
            
            if (token) {
                // Si existe, lo pegamos en los headers de la petición
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error al obtener el token para la petición:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuesta
api.interceptors.response.use(
    async (response) => {
        // Buscamos el header que configuramos en Spring Boot
        const newToken = response.headers['new-token'];

        if (newToken) {
            try {
                // Si el servidor nos mandó un token fresco, lo guardamos
                await AsyncStorage.setItem('userToken', newToken);
                console.log("Sesión renovada automáticamente por 30 días más.");
            } catch (error) {
                console.error("Error al guardar el nuevo token renovado:", error);
            }
        }
        return response;
    },
    async (error) => {
        // Si el servidor responde 401 (Unauthorized), significa que los 30 días pasaron
        // sin que el usuario abriera la app. En ese caso, limpiamos todo.
        if (error.response && error.response.status === 401) {
            console.warn("La sesión ha expirado (pasaron más de 30 días).");
            await AsyncStorage.removeItem('userToken');
            // Aquí el AuthContext detectará que el token es null y mandará al Login automáticamente
        }
        return Promise.reject(error);
    }
);

export default api;