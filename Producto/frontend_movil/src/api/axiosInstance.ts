import axios from 'axios';

const DEVELOPER_IP = process.env.EXPO_PUBLIC_DEVELOPER_IP || "localhost";


const api = axios.create({
    baseURL: `http://${DEVELOPER_IP}:8080/api`, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;