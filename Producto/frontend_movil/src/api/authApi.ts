import api from './axiosInstance';

export const forgotPassword = async (email: string) => {
    // Usamos el nombre de campo exacto que definimos en el DTO de Java
    return await api.post('/auth/forgot-password', { correo_usr: email });
};

export const resetPassword = async (token: string, nuevaPass: string) => {
    return await api.post('/auth/reset-password', { 
        token: token, 
        nueva_pass: nuevaPass 
    });
};