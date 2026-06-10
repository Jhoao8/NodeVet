import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAllRequests } from '../api/axiosInstance';
import api from '../api/axiosInstance';
import {UsuarioData} from '../api/authApi';



interface AuthContextData {
    userToken: string | null;
    userData: UsuarioData | null; 
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar token al abrir la app
    useEffect(() => {
    const loadStorageData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            // AQUÍ: Valida si el token existe y es válido
            if (token) {
                // Intenta hacer una petición de prueba para verificar si el token es válido
                try {
                    // Usa un endpoint simple que requiera autenticación
                    await api.get('/v1/auth/validate', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Si llega aquí, el token es válido
                    setUserToken(token);
                } catch (tokenError) {
                    // Si hay error, el token es inválido/expirado
                    console.log('Token inválido:', tokenError);
                    await AsyncStorage.removeItem('userToken');
                    setUserToken(null);
                }
            }
        } catch (e) {
            console.log('Error cargando token:', e);
        } finally {
            setIsLoading(false);
        }
    };
    loadStorageData();
}, []);

    

    const signIn = async (token: string) => {
        setUserToken(token);
        await AsyncStorage.setItem('userToken', token);
    };

    const signOut = async () => {
        try {
            // Cancelar todas las peticiones pendientes
            cancelAllRequests();
            
            // Limpiar el token
            setUserToken(null);
            await AsyncStorage.removeItem('userToken');
        } catch (error) {
            console.error('Error en signOut:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);