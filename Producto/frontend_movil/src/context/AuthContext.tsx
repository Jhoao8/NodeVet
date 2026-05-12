import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface AuthContextData {
    userToken: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
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
                if (token) setUserToken(token);
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
        setUserToken(null);
        await AsyncStorage.removeItem('userToken');
    };

    return (
        <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);