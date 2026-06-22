import { useState } from 'react';
import api from '../../api/client';

interface UsuarioEditable {
  idUsuario: string | number;
  nombreCompleto: string;
  correoUsr: string;
  telefonoUsr: string;
}

interface Props {
  usuario: UsuarioEditable;
  onSuccess: () => void;
  onCancel: () => void;
}


function separarNombre(nombreCompleto: string): { nombre: string; apellido: string } {
  const partes = (nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { nombre: '', apellido: '' };
  return { nombre: partes[0], apellido: partes.slice(1).join(' ') };
}

export default function EditarUsuarioForm({ usuario, onSuccess, onCancel }: Props) {
  const iniciales = separarNombre(usuario.nombreCompleto);
  const [nombreUsr, setNombreUsr] = useState(iniciales.nombre);
  const [apellidoUsr, setApellidoUsr] = useState(iniciales.apellido);
  const [correoUsr, setCorreoUsr] = useState(usuario.correoUsr || '');
  const [telefonoUsr, setTelefonoUsr] = useState(usuario.telefonoUsr || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mensajeError = (err: any): string => {
    const data = err?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    return data?.message || data?.error || 'No se pudo actualizar el usuario.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreUsr.trim() || !apellidoUsr.trim()) {
      setError('El nombre y el apellido son obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoUsr.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/v1/usuarios/${usuario.idUsuario}`, {
        nombreUsr: nombreUsr.trim(),
        apellidoUsr: apellidoUsr.trim(),
        telefonoUsr: telefonoUsr.trim(),
        correoUsr: correoUsr.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modificar usuario</h2>
          <p>Actualiza los datos de la cuenta seleccionada</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">1</span>
                Datos de la cuenta
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="edit-nombre">Nombre</label>
                  <input
                    id="edit-nombre"
                    type="text"
                    value={nombreUsr}
                    onChange={(e) => setNombreUsr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-apellido">Apellido</label>
                  <input
                    id="edit-apellido"
                    type="text"
                    value={apellidoUsr}
                    onChange={(e) => setApellidoUsr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="edit-correo">Correo electrónico</label>
                  <input
                    id="edit-correo"
                    type="email"
                    value={correoUsr}
                    onChange={(e) => setCorreoUsr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="edit-telefono">
                    Teléfono <span className="optional-tag">(opcional)</span>
                  </label>
                  <input
                    id="edit-telefono"
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={telefonoUsr}
                    onChange={(e) => setTelefonoUsr(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
