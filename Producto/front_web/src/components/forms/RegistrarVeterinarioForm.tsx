import { useState, useEffect } from 'react';
import api from '../../api/client';
import type { AxiosResponse } from 'axios';
import type { Especialidad } from '../../interfaces/Especialidad.ts';

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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registrar Nuevo Veterinario</h2>
          <p>Completa los datos para dar de alta a un nuevo profesional en NodeVet</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">1</span>
                Datos personales
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="nombreUsr">Nombre</label>
                  <input
                    id="nombreUsr"
                    type="text"
                    placeholder="Ej. Javiera"
                    value={nombreUsr}
                    onChange={e => setNombreUsr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="apellidoUsr">Apellido</label>
                  <input
                    id="apellidoUsr"
                    type="text"
                    placeholder="Ej. Soto"
                    value={apellidoUsr}
                    onChange={e => setApellidoUsr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="correoUsr">Correo electrónico</label>
                  <input
                    id="correoUsr"
                    type="email"
                    placeholder="nombre@dominio.cl"
                    value={correoUsr}
                    onChange={e => setCorreoUsr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="telefonoUsr">
                    Teléfono <span className="optional-tag">(opcional)</span>
                  </label>
                  <input
                    id="telefonoUsr"
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={telefonoUsr}
                    onChange={e => setTelefonoUsr(e.target.value)}
                  />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="passUsr">Contraseña</label>
                  <input
                    id="passUsr"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className={passError ? 'input-error' : ''}
                    value={passUsr}
                    onChange={e => {
                      setPassUsr(e.target.value);
                      if (passError) setPassError('');
                    }}
                    onBlur={() => setPassError(validarPassword(passUsr))}
                    required
                  />
                  {passError ? (
                    <span className="field-error">{passError}</span>
                  ) : (
                    <span className="field-hint">Al menos 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">2</span>
                Identificación profesional
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="runVet">RUN</label>
                  <input
                    id="runVet"
                    type="number"
                    placeholder="Sin puntos ni dígito verificador"
                    className={runError ? 'input-error' : ''}
                    value={runVet}
                    onChange={e => {
                      setRunVet(e.target.value === '' ? '' : Number(e.target.value));
                      if (runError) setRunError('');
                    }}
                    onBlur={() => setRunError(validarRun(runVet))}
                    required
                  />
                  {runError ? (
                    <span className="field-error">{runError}</span>
                  ) : (
                    <span className="field-hint">Solo números, mínimo 7 dígitos.</span>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="dvVet">Dígito verificador</label>
                  <input
                    id="dvVet"
                    type="text"
                    placeholder="0-9 o K"
                    className={dvError ? 'input-error' : ''}
                    value={dvVet}
                    onChange={e => {
                      setDvVet(e.target.value);
                      if (dvError) setDvError('');
                    }}
                    onBlur={() => setDvError(validarDv(dvVet))}
                    maxLength={1}
                    required
                  />
                  {dvError ? (
                    <span className="field-error">{dvError}</span>
                  ) : (
                    <span className="field-hint">Un solo carácter: 0-9 o la letra K.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">3</span>
                Especialidades
              </h3>

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
                  className="btn-add-especialidad"
                  onClick={handleCrearEspecialidad}
                  disabled={creandoEspecialidad || !nuevaEspecialidad.trim()}
                >
                  {creandoEspecialidad ? 'Agregando...' : '+ Agregar'}
                </button>
              </div>
              {errorEspecialidad && <span className="field-error">{errorEspecialidad}</span>}

              <div className="checkbox-group" style={{ marginTop: '10px' }}>
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
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar veterinario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}