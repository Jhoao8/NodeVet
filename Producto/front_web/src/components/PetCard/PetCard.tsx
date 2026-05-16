import React, { useState } from 'react';
import type { PetCardProps, Mascota } from './PetCard.types.js';
import './PetCard.css';

const PetCard: React.FC<PetCardProps> = ({ 
  mascota, 
  onEdit, 
  onDelete, 
  onClick 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sexoTexto = mascota.sexo === 1 ? 'Macho' : 'Hembra';
  const nombreDisplay = mascota.nomMascota || 'Sin nombre';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (mascota.idMascota && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(mascota.idMascota);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error al eliminar la mascota:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(mascota);
    }
  };

  return (
    <>
      <div className="pet-card" onClick={onClick}>
        {/* Imagen Container */}
        <div className="pet-card__image-container">
          {mascota.imagenMascota ? (
            <img
              src={mascota.imagenMascota}
              alt={nombreDisplay}
              className="pet-card__image"
            />
          ) : (
            <div className="pet-card__placeholder">
              <span>Sin foto</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pet-card__actions">
            {onEdit && (
              <button
                className="pet-card__action-btn pet-card__action-btn--edit"
                onClick={handleEditClick}
                title="Editar mascota"
              >
                ✎
              </button>
            )}
            {onDelete && (
              <button
                className="pet-card__action-btn pet-card__action-btn--delete"
                onClick={handleDeleteClick}
                title="Eliminar mascota"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="pet-card__content">
          <h3 className="pet-card__name" title={nombreDisplay}>
            {nombreDisplay}
          </h3>
          <p className="pet-card__info">
            {mascota.especie && `${mascota.especie} • `}
            {sexoTexto}
          </p>
          {mascota.raza && (
            <p className="pet-card__breed">{mascota.raza}</p>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              ¿Seguro que quieres eliminar a {nombreDisplay}?
            </h2>
            <p className="modal-message">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn--danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PetCard;
