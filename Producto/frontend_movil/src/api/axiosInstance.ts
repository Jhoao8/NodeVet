import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVELOPER_IP = process.env.EXPO_PUBLIC_DEVELOPER_IP || "localhost";

const api = axios.create({
    baseURL: `http://${DEVELOPER_IP}:8080/api`, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

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

export default api;