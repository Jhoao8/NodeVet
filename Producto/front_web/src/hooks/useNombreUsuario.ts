import { useEffect, useState } from 'react';
import api from '../api/client';

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
