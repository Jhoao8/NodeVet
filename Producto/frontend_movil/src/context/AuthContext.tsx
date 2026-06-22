import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAllRequests } from '../api/axiosInstance';
import api from '../api/axiosInstance';
import { UsuarioData } from '../api/authApi';

interface AuthContextData {
    userToken: string | null;
    userRole: string | null; 
    userData: UsuarioData | null; 
    isLoading: boolean;
    signIn: (token: string, role?: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null); 
    const [userData, setUserData] = useState<UsuarioData | null>(null); 
    const [isLoading, setIsLoading] = useState(true);

    // Cargar token y rol al abrir la app
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const role = await AsyncStorage.getItem('userRole'); 
                
                if (token) {
                    try {
                        // CORRECCIÓN: Validamos el token intentando acceder al perfil
                        await api.get('/v1/usuarios/perfil', { 
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        setUserToken(token);
                        if (role) setUserRole(role); 

                    } catch (tokenError) {
                        console.log('Token inválido:', tokenError);
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('userRole');
                        setUserToken(null);
                        setUserRole(null);
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

    const signIn = async (token: string, role?: string) => {
        // 1. Actualizamos la memoria rápida (Estado de React) AL MISMO TIEMPO
        setUserToken(token);
        if (role) {
            setUserRole(role);
        }
        
        // 2. Después de que React ya sabe el rol, lo guardamos en el disco duro (AsyncStorage)
        await AsyncStorage.setItem('userToken', token);
        if (role) {
            await AsyncStorage.setItem('userRole', role);
        }
    };

    const signOut = async () => {
        try {
            cancelAllRequests();
            setUserToken(null);
            setUserRole(null); 
            setUserData(null); // Limpiamos los datos del usuario al salir
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userRole'); 
        } catch (error) {
            console.error('Error en signOut:', error);
            throw error;
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await api.get('/v1/usuarios/perfil');
            setUserData(response.data);
            console.log("fetchUserData ejecutado");
        } catch (error) {
            console.error("Error obteniendo datos del usuario", error);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, userRole, userData, isLoading, signIn, signOut, fetchUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);