import axios from 'axios';

const api = axios.create({
    // Usa tu IP real (no localhost) si pruebas en un dispositivo físico
    baseURL: 'http://192.168.18.38:8080/api', 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;