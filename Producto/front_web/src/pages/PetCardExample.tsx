import { useState, useEffect } from 'react';
import api from '../api/client';
import type { AxiosResponse } from 'axios';
import type { Especialidad } from '../interfaces/Especialidad';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RegistrarVeterinarioForm({ onSuccess, onCancel }: Props) {
  const [nombreUsr, setNombreUsr] = useState('');
  const [apellidoUsr, setApellidoUsr] = useState('');
  const [correoUsr, setCorreoUsr] = useState('');
  const [passUsr, setPassUsr] = useState('');
  const [telefonoUsr, setTelefonoUsr] = useState('');
  const [runVet, setRunVet] = useState<number | ''>('');
  const [dvVet, setDvVet] = useState('');
  const [especialidadesIds, setEspecialidadesIds] = useState<number[]>([]);

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Errores de validación por campo
  const [passError, setPassError] = useState('');
  const [runError, setRunError] = useState('');
  const [dvError, setDvError] = useState('');

  const validarPassword = (value: string): string => {
    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!/[A-Z]/.test(value)) {
      return 'La contraseña debe contener al menos 1 mayúscula.';
    }
    if (!/[0-9]/.test(value)) {
      return 'La contraseña debe contener al menos 1 número.';
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return 'La contraseña debe contener al menos 1 símbolo.';
    }
    return '';
  };

  const validarRun = (value: number | ''): string => {
    if (value === '') {
      return 'El RUN es obligatorio.';
    }
    // Solo dígitos (sin puntos ni guion) y mínimo 7 dígitos
    const digitos = String(value);
    if (!/^\d+$/.test(digitos) || digitos.length < 7) {
      return 'El RUN debe ser numérico y tener al menos 7 dígitos.';
    }
    return '';
  };

  const validarDv = (value: string): string => {
    if (value.length !== 1) {
      return 'El dígito verificador debe tener exactamente 1 carácter.';
    }
    if (!/^[0-9kK]$/.test(value)) {
      return 'El dígito verificador debe ser un número del 0 al 9, o la letra K.';
    }
    return '';
  };

  // Estado para la creación de una nueva especialidad
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');
  const [creandoEspecialidad, setCreandoEspecialidad] = useState(false);
  const [errorEspecialidad, setErrorEspecialidad] = useState('');

  const cargarEspecialidades = () => {
    return api.get<Especialidad[]>('/v1/especialidades')
      .then((response: AxiosResponse<Especialidad[]>) => {
        setEspecialidades(response.data);
      })
      .catch((err: unknown) => {
        console.error('Error fetching specialities:', err);
        setError('No se pudieron cargar las especialidades.');
      });
  };

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const handleEspecialidadChange = (id: number) => {
    setEspecialidadesIds(prev =>
      prev.includes(id) ? prev.filter(espId => espId !== id) : [...prev, id]
    );
  };

  const handleCrearEspecialidad = async () => {
    const nombre = nuevaEspecialidad.trim();
    if (!nombre) {
      setErrorEspecialidad('Ingresa un nombre para la especialidad.');
      return;
    }
    // Evitar duplicados visibles en el cliente (case-insensitive)
    const yaExiste = especialidades.some(
      esp => esp.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (yaExiste) {
      setErrorEspecialidad('Esa especialidad ya existe.');
      return;
    }

    setCreandoEspecialidad(true);
    setErrorEspecialidad('');
    try {
      const response = await api.post<Especialidad>('/v1/especialidades/crear', { nombre });
      const creada = response.data;
      setEspecialidades(prev => [...prev, creada]);
      // Seleccionarla automáticamente para el veterinario que se está registrando
      setEspecialidadesIds(prev => [...prev, creada.id]);
      setNuevaEspecialidad('');
    } catch (err: any) {
      console.error('Error creating speciality:', err);
      setErrorEspecialidad(err.response?.data?.message || 'No se pudo crear la especialidad.');
    } finally {
      setCreandoEspecialidad(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar contraseña, RUN y dígito verificador antes de enviar
    const passMsg = validarPassword(passUsr);
    const runMsg = validarRun(runVet);
    const dvMsg = validarDv(dvVet);

    setPassError(passMsg);
    setRunError(runMsg);
    setDvError(dvMsg);

    if (passMsg || runMsg || dvMsg) {
      setError('Revisa los campos marcados antes de continuar.');
      return;
    }

    setLoading(true);

    const vetData = {
      nombreUsr,
      apellidoUsr,
      correoUsr,
      passUsr,
      telefonoUsr,
      runVet,
      dvVet,
      especialidadesIds,
    };

    try {
      await api.post('/v1/veterinarios/registrar', vetData);
      onSuccess();
    } catch (err: any) {
      console.error('Error registering veterinarian:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al registrar el veterinario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Registrar Nuevo Veterinario</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input type="text" placeholder="Nombre" value={nombreUsr} onChange={e => setNombreUsr(e.target.value)} required />
            <input type="text" placeholder="Apellido" value={apellidoUsr} onChange={e => setApellidoUsr(e.target.value)} required />
            <input type="email" placeholder="Correo Electrónico" value={correoUsr} onChange={e => setCorreoUsr(e.target.value)} required />
            <div className="field-with-error">
              <input
                type="password"
                placeholder="Contraseña"
                value={passUsr}
                onChange={e => {
                  setPassUsr(e.target.value);
                  if (passError) setPassError('');
                }}
                onBlur={() => setPassError(validarPassword(passUsr))}
                required
              />
              {passError && <span className="field-error">{passError}</span>}
            </div>
            <input type="text" placeholder="Teléfono" value={telefonoUsr} onChange={e => setTelefonoUsr(e.target.value)} />
            <div className="field-with-error">
              <input
                type="number"
                placeholder="RUN (sin dígito verificador)"
                value={runVet}
                onChange={e => {
                  setRunVet(e.target.value === '' ? '' : Number(e.target.value));
                  if (runError) setRunError('');
                }}
                onBlur={() => setRunError(validarRun(runVet))}
                required
              />
              {runError && <span className="field-error">{runError}</span>}
            </div>
            <div className="field-with-error">
              <input
                type="text"
                placeholder="Dígito Verificador"
                value={dvVet}
                onChange={e => {
                  setDvVet(e.target.value);
                  if (dvError) setDvError('');
                }}
                onBlur={() => setDvError(validarDv(dvVet))}
                maxLength={1}
                required
              />
              {dvError && <span className="field-error">{dvError}</span>}
            </div>
          </div>
          <p className="password-hint">
            La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
          </p>

          <h4>Especialidades</h4>

          <div className="nueva-especialidad-row">
            <input
              type="text"
              placeholder="Nueva especialidad (ej. Cirugía)"
              value={nuevaEspecialidad}
              onChange={e => {
                setNuevaEspecialidad(e.target.value);
                if (errorEspecialidad) setErrorEspecialidad('');
              }}
              disabled={creandoEspecialidad}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCrearEspecialidad}
              disabled={creandoEspecialidad || !nuevaEspecialidad.trim()}
            >
              {creandoEspecialidad ? 'Agregando...' : '+ Agregar especialidad'}
            </button>
          </div>
          {errorEspecialidad && <div className="error-message">{errorEspecialidad}</div>}

          <div className="checkbox-group">
            {especialidades.length === 0 && (
              <span className="checkbox-group-empty">Aún no hay especialidades registradas.</span>
            )}
            {especialidades.map(esp => (
              <label key={esp.id}>
                <input
                  type="checkbox"
                  checked={especialidadesIds.includes(esp.id)}
                  onChange={() => handleEspecialidadChange(esp.id)}
                />
                {esp.nombre}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}