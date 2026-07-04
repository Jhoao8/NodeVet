import { useState, useEffect } from 'react';
import api from '../../api/client';
import type { AxiosResponse } from 'axios';
import type { Especialidad } from '../../interfaces/Especialidad.ts';

interface Props {
  onSuccess: (vet?: { idVeterinario?: number; nombreCompleto?: string }) => void;
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
  const [nombreError, setNombreError] = useState('');
  const [passError, setPassError] = useState('');
  const [runError, setRunError] = useState('');
  const [dvError, setDvError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');

  const validarNombre = (value: string): string => {
    if (value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }
    return '';
  };

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

  const validarTelefono = (value: string): string => {
    // Campo opcional: vacío es válido, pero si se ingresa debe ser 9 dígitos comenzando con 9.
    const v = value.trim();
    if (v === '') {
      return '';
    }
    if (!/^9\d{8}$/.test(v)) {
      return 'El teléfono debe comenzar con 9 y tener 9 dígitos.';
    }
    return '';
  };

  // Estado para la creación de una nueva especialidad
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');
  const [creandoEspecialidad, setCreandoEspecialidad] = useState(false);
  const [errorEspecialidad, setErrorEspecialidad] = useState('');

  // Generador de correo institucional @nodevet.com (misma lógica que el móvil)
  const [nivelColision, setNivelColision] = useState(0);
  const [errorCorreoGen, setErrorCorreoGen] = useState('');

  const generarCorreo = (nivel = nivelColision) => {
    const partes = `${nombreUsr} ${apellidoUsr}`.trim().split(/\s+/).filter(Boolean);
    if (partes.length < 2) {
      setErrorCorreoGen('Ingresa al menos nombre y apellido para generar el correo.');
      return;
    }
    setErrorCorreoGen('');
    const nombre = partes[0];
    const apellidoP = partes[1];
    const apellidoM = partes[2] || '';

    let base = nombre.substring(0, 2).toLowerCase();
    base += apellidoP.toLowerCase().replace(/\s/g, '');
    if (apellidoM.length > 0) {
      const letras = Math.min(1 + nivel, apellidoM.length);
      base += apellidoM.substring(0, letras).toLowerCase();
    } else if (nivel > 0) {
      base += nivel;
    }
    const clean = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
    setCorreoUsr(`${clean}@nodevet.com`);
  };

  const generarVariante = () => {
    const nuevoNivel = nivelColision + 1;
    setNivelColision(nuevoNivel);
    generarCorreo(nuevoNivel);
  };

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
      const response = await api.post<Especialidad>('/v1/especialidades', { nombre });
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

    // Validar nombre, contraseña, RUN, dígito verificador y teléfono antes de enviar
    const nombreMsg = validarNombre(nombreUsr);
    const passMsg = validarPassword(passUsr);
    const runMsg = validarRun(runVet);
    const dvMsg = validarDv(dvVet);
    const telMsg = validarTelefono(telefonoUsr);

    setNombreError(nombreMsg);
    setPassError(passMsg);
    setRunError(runMsg);
    setDvError(dvMsg);
    setTelefonoError(telMsg);

    if (nombreMsg || passMsg || runMsg || dvMsg || telMsg) {
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
      const resp = await api.post('/v1/veterinarios', vetData);
      onSuccess(resp.data);
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
                    className={nombreError ? 'input-error' : ''}
                    value={nombreUsr}
                    onChange={e => {
                      setNombreUsr(e.target.value);
                      if (nombreError) setNombreError('');
                    }}
                    onBlur={() => setNombreError(validarNombre(nombreUsr))}
                    required
                  />
                  {nombreError && <span className="field-error">{nombreError}</span>}
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
                  <label htmlFor="correoUsr">Correo institucional</label>
                  <input
                    id="correoUsr"
                    type="email"
                    placeholder="nombre@nodevet.com"
                    value={correoUsr}
                    onChange={e => setCorreoUsr(e.target.value)}
                    required
                  />
                  <div className="correo-gen-row">
                    <button
                      type="button"
                      className="btn-generar-correo"
                      onClick={() => {
                        setNivelColision(0);
                        generarCorreo(0);
                      }}
                    >
                      ✉️ Generar correo institucional
                    </button>
                    {correoUsr.endsWith('@nodevet.com') && (
                      <button type="button" className="btn-variante-correo" onClick={generarVariante}>
                        ↻ ¿Correo ya existe? Generar variante
                      </button>
                    )}
                  </div>
                  {errorCorreoGen && <span className="field-error">{errorCorreoGen}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="telefonoUsr">
                    Teléfono <span className="optional-tag">(opcional)</span>
                  </label>
                  <input
                    id="telefonoUsr"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="Ej. 912345678"
                    className={telefonoError ? 'input-error' : ''}
                    value={telefonoUsr}
                    onChange={e => {
                      setTelefonoUsr(e.target.value.replace(/\D/g, ''));
                      if (telefonoError) setTelefonoError('');
                    }}
                    onBlur={() => setTelefonoError(validarTelefono(telefonoUsr))}
                  />
                  {telefonoError ? (
                    <span className="field-error">{telefonoError}</span>
                  ) : (
                    <span className="field-hint">Opcional. Si lo ingresas: 9 dígitos comenzando con 9.</span>
                  )}
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