import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  username: string;
  role: 'ADMIN' | 'VETERINARIO' | 'TUTOR' | null;
  token: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser>({
    username: '',
    role: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  // Decodificar JWT para extraer información
  const decodeToken = useCallback((token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }, []);

  // Obtener rol del usuario desde localStorage o JWT
  const getRoleFromStorage = useCallback(() => {
    return localStorage.getItem('userRole') as 'ADMIN' | 'VETERINARIO' | 'TUTOR' | null;
  }, []);

  // Obtener usuario desde localStorage
  const getUsernameFromStorage = useCallback(() => {
    return localStorage.getItem('username') || '';
  }, []);

  // Obtener token desde localStorage
  const getTokenFromStorage = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Inicializar usuario desde localStorage
  useEffect(() => {
    const token = getTokenFromStorage();
    const role = getRoleFromStorage();
    const username = getUsernameFromStorage();

    if (token && username) {
      setUser({
        username,
        role: role || null,
        token,
      });
    }
    setLoading(false);
  }, [getTokenFromStorage, getRoleFromStorage, getUsernameFromStorage]);

  // Login
  const login = useCallback((token: string, role: 'ADMIN' | 'VETERINARIO' | 'TUTOR', username: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    setUser({
      username,
      role,
      token,
    });
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setUser({
      username: '',
      role: null,
      token: null,
    });
  }, []);

  // Verificar si está autenticado
  const isAuthenticated = useCallback(() => {
    return !!user.token && !!user.role;
  }, [user.token, user.role]);

  // Verificar si tiene un rol específico
  const hasRole = useCallback((role: 'ADMIN' | 'VETERINARIO' | 'TUTOR') => {
    return user.role === role;
  }, [user.role]);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
    hasRole,
    decodeToken,
  };
};
