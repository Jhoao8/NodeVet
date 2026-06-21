import { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * Devuelve el nombre real del usuario logueado (nombreCompleto) consultando
 * GET /v1/usuarios/perfil. El JWT solo trae el correo, no el nombre, por eso
 * se obtiene del perfil. Disponible para cualquier rol (endpoint authenticated).
 * Retorna '' mientras carga o si no hay sesión.
 */
export function useNombreUsuario(): string {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNombre('');
      return;
    }
    let cancelado = false;
    api
      .get('/v1/usuarios/perfil')
      .then((resp) => {
        if (!cancelado && resp.data?.nombreCompleto) {
          setNombre(resp.data.nombreCompleto);
        }
      })
      .catch(() => {
        /* sin nombre: los headers usan un texto por defecto */
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return nombre;
}
