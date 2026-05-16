import React, { useEffect, useState } from 'react';
import { Mascota } from '../interfaces/Mascota';
import PetCard from '../components/PetCard';
import client from '../api/client';
import './PetCardExample.css';

/**
 * Ejemplo de página que usa el componente PetCard
 * Este archivo muestra cómo integrar las tarjetas de mascotas en tu aplicación
 */

const PetCardExample: React.FC = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mascotas al montar el componente
  useEffect(() => {
    fetchMascotas();
  }, []);

  const fetchMascotas = async () => {
    try {
      setLoading(true);
      const response = await client.get('/v1/mascotas/listar');
      setMascotas(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setError('No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMascota = async (id: number) => {
    try {
      await client.delete(`/v1/mascotas/eliminar/${id}`);
      setMascotas(mascotas.filter(m => m.idMascota !== id));
      alert('Mascota eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar mascota:', err);
      alert('Error al eliminar la mascota');
    }
  };

  const handleEditMascota = (mascota: Mascota) => {
    // Aquí puedes redirigir a la página de edición o abrir un modal
    console.log('Editar mascota:', mascota);
    // Ejemplo: navigate('/editar-mascota', { state: { mascota } });
  };

  const handlePetCardClick = (mascota: Mascota) => {
    // Aquí puedes redirigir a los detalles de la mascota
    console.log('Ver detalles de:', mascota.nomMascota);
    // Ejemplo: navigate(`/mascota/${mascota.idMascota}`);
  };

  if (loading) {
    return <div className="pet-list-container"><p>Cargando mascotas...</p></div>;
  }

  if (error) {
    return <div className="pet-list-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="pet-list-container">
      <h1>Mis Mascotas</h1>
      
      {mascotas.length === 0 ? (
        <div className="no-pets">
          <p>No tienes mascotas registradas aún</p>
          {/* Aquí puedes poner un botón para agregar mascota */}
        </div>
      ) : (
        <div className="pet-cards-grid">
          {mascotas.map((mascota) => (
            <PetCard
              key={mascota.idMascota}
              mascota={mascota}
              onEdit={handleEditMascota}
              onDelete={handleDeleteMascota}
              onClick={() => handlePetCardClick(mascota)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PetCardExample;
