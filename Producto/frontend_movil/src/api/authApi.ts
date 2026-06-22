import api from './axiosInstance';

export const forgotPassword = async (email: string) => {
    // Usamos el nombre de campo exacto que definimos en el DTO de Java
    return await api.post('/auth/recuperacion', { correo_usr: email });
};

export const resetPassword = async (token: string, nuevaPass: string) => {
    // CORRECCIÓN: Método PUT y ruta /auth/password
    return await api.put('/auth/password', { 
        token: token, 
        nueva_pass: nuevaPass 
    });
};

export interface RegistroData {
    nombreUsr: string;
    apellidoUsr: string;
    correoUsr: string;
    passUsr: string;
    telefonoUsr: string;
}

export interface UsuarioData {
    idUsuario: number;
    nombreCompleto: string;
    correoUsr: string;
    telefonoUsr: string;
    estadoUsr: number;
}

export const registro = async (userData: RegistroData) => {
    // Como el baseURL es '/api', solo agregamos el resto de la ruta del UsuarioController
    return await api.post('/v1/usuarios/registro', userData);
};

export const login = async (correoUsr: string, passUsr: string) => {
    return await api.post('/auth/login', {
        correoUsr,
        passUsr
    });
};

export const obtenerPerfilUsuario = async () => {
    return await api.get('/v1/usuarios/perfil');
};