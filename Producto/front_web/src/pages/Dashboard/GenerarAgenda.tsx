import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import AdminSidebar from '../../components/AdminSidebar';
import UserMenu from '../../components/UserMenu';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import { formatEspecialidades } from '../../interfaces/Veterinario';
import type { VeterinarioDTO } from '../../interfaces/Veterinario';
import '../../styles/Dashboard.css';

// Espejo web de las pantallas móviles CrearJornadaScreen (regla de jornada) y
// ModalBloquesScreen (generación de bloques): selector real de profesionales,
// chips de días, año fijo del sistema y modales de resumen antes de guardar.

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 7, nombre: 'Domingo' },
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function mensajeError(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (typeof data === 'string' && data) return data;
  return data?.mensaje || data?.error || data?.message || fallback;
}

export default function GenerarAgenda() {
  const navigate = useNavigate();
  const location = useLocation();
  const nombreUsuario = useNombreUsuario();

  const vetPreseleccionado = (location.state as any)?.vet as VeterinarioDTO | undefined;

  // Año fijo del sistema, igual que el móvil
  const anioSistema = new Date().getFullYear();

  const [vets, setVets] = useState<VeterinarioDTO[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [idVetSel, setIdVetSel] = useState<string>(
    vetPreseleccionado ? String(vetPreseleccionado.idVeterinario) : '',
  );

  // Jornada
  const [diasSel, setDiasSel] = useState<number[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [guardandoJornada, setGuardandoJornada] = useState(false);
  const [showResumenJornada, setShowResumenJornada] = useState(false);

  // Bloques
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [duracion, setDuracion] = useState('30');
  const [generando, setGenerando] = useState(false);
  const [showResumenBloques, setShowResumenBloques] = useState(false);

  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    let cancelado = false;
    api
      .get<VeterinarioDTO[]>('/v1/veterinarios')
      .then((resp) => {
        if (cancelado) return;
        // Solo profesionales activos, igual que el móvil
        const activos = resp.data.filter((v) => v.estadoUsr === 1);
        setVets(activos);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudieron cargar los veterinarios.');
      })
      .finally(() => {
        if (!cancelado) setLoadingVets(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const vetSeleccionado =
    vets.find((v) => v.idVeterinario === Number(idVetSel)) ??
    (vetPreseleccionado?.idVeterinario === Number(idVetSel) ? vetPreseleccionado : undefined);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const toggleDia = (id: number) => {
    setDiasSel((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id].sort((a, b) => a - b),
    );
  };

  const getDiasSeleccionadosTexto = (): string =>
    diasSel.map((id) => DIAS_SEMANA.find((d) => d.id === id)?.nombre).join(', ');

  // ─── Jornada base ───
  const validarJornada = () => {
    setError('');
    setOk('');
    if (!vetSeleccionado) {
      setError('Por favor, selecciona un veterinario.');
      return;
    }
    if (diasSel.length === 0) {
      setError('Por favor, selecciona al menos un día de la semana.');
      return;
    }
    if (!horaInicio || !horaFin) {
      setError('Las horas de inicio y término son obligatorias.');
      return;
    }
    if (horaInicio >= horaFin) {
      setError('La hora de apertura debe ser anterior a la hora de cierre.');
      return;
    }
    setShowResumenJornada(true);
  };

  const registrarJornada = async () => {
    setShowResumenJornada(false);
    setGuardandoJornada(true);
    try {
      await Promise.all(
        diasSel.map((dia) =>
          api.post('/v1/jornadas', {
            idVet: vetSeleccionado!.idVeterinario,
            diaSemana: dia,
            horaInicio,
            horaFin,
          }),
        ),
      );
      setOk(
        'Jornada creada con éxito. Para editar alguna jornada, ve al detalle del veterinario en "Veterinarios".',
      );
      setDiasSel([]);
    } catch (err) {
      setError(
        mensajeError(err, 'El rango horario entra en conflicto o el formato no es soportado.'),
      );
    } finally {
      setGuardandoJornada(false);
    }
  };

  // ─── Bloques ───
  const validarBloques = () => {
    setError('');
    setOk('');
    if (!vetSeleccionado) {
      setError('Por favor, asigna un veterinario para el procesamiento.');
      return;
    }
    const minutos = parseInt(duracion, 10);
    if (!duracion || isNaN(minutos) || minutos <= 0) {
      setError('Por favor, ingresa una duración válida en minutos (mayor a 0).');
      return;
    }
    setShowResumenBloques(true);
  };

  const generarBloques = async () => {
    setShowResumenBloques(false);
    setGenerando(true);
    try {
      await api.post('/v1/agendas', null, {
        params: {
          idVet: vetSeleccionado!.idVeterinario,
          anio: anioSistema,
          mes,
          duracionMinutos: parseInt(duracion, 10),
        },
      });
      setOk(
        `¡Agenda generada! Se han procesado y guardado correctamente los bloques médicos para ${vetSeleccionado!.nombreCompleto}.`,
      );
    } catch (err) {
      setError(
        mensajeError(
          err,
          'El veterinario no posee jornadas base configuradas para mapear este mes.',
        ),
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <div className="user-section">
          <span className="notification">🔔</span>
          <UserMenu nombre={nombreUsuario} onLogout={handleLogout} />
        </div>
      </header>

      <div className="dashboard-content">
        <AdminSidebar active="agenda" />

        <main className="main-content">
          <section className="dashboard-section">
            <h2>Generar Agenda</h2>
            <p style={{ color: '#555', marginTop: '-6px', marginBottom: '20px' }}>
              Define la regla de jornada del veterinario y genera sus bloques médicos para un mes.
            </p>

            {error && <div className="error-message">{error}</div>}
            {ok && <div className="success-message">{ok}</div>}

            {/* Paso 1: Veterinario */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">1</span>
                Veterinario Asignado
              </h3>
              <div className="form-grid">
                <div className="form-field span-2">
                  <label htmlFor="vet">Profesional</label>
                  <select
                    id="vet"
                    value={idVetSel}
                    onChange={(e) => setIdVetSel(e.target.value)}
                    disabled={loadingVets}
                  >
                    <option value="">
                      {loadingVets ? 'Cargando profesionales...' : 'Seleccionar profesional...'}
                    </option>
                    {vets.map((v) => (
                      <option key={v.idVeterinario} value={v.idVeterinario}>
                        {v.nombreCompleto} — {formatEspecialidades(v.especialidades)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Paso 2: Regla de jornada (espejo de CrearJornadaScreen) */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">2</span>
                Definir Regla de Jornada
              </h3>
              <p className="field-hint" style={{ display: 'block', marginBottom: '10px' }}>
                Selecciona los días sobre los cuales se aplicará este patrón de horario.
              </p>

              <div className="dias-chips">
                {DIAS_SEMANA.map((dia) => {
                  const selected = diasSel.includes(dia.id);
                  return (
                    <button
                      type="button"
                      key={dia.id}
                      className={`dia-chip ${selected ? 'selected' : ''}`}
                      onClick={() => toggleDia(dia.id)}
                    >
                      {dia.nombre}
                    </button>
                  );
                })}
              </div>

              <div className="form-grid" style={{ marginTop: '14px' }}>
                <div className="form-field">
                  <label htmlFor="horaInicio">Hora Apertura</label>
                  <input
                    id="horaInicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="horaFin">Hora Cierre</label>
                  <input
                    id="horaFin"
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn-submit"
                style={{ marginTop: '12px' }}
                onClick={validarJornada}
                disabled={guardandoJornada}
              >
                {guardandoJornada ? 'Guardando en Servidor...' : '🗓️ Registrar Regla de Horario'}
              </button>
            </div>

            {/* Paso 3: Bloques (espejo de ModalBloquesScreen) */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">3</span>
                Generación de Bloques Médicos
              </h3>
              <p className="field-hint" style={{ display: 'block', marginBottom: '10px' }}>
                Convierte las jornadas base en bloques de atención reservables para un mes.
              </p>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="mes">Mes Planificación</label>
                  <select id="mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="anio">Año Vigente</label>
                  <input id="anio" type="number" value={anioSistema} readOnly disabled />
                </div>
                <div className="form-field span-2">
                  <label htmlFor="duracion">Duración de cada Bloque (Minutos)</label>
                  <input
                    id="duracion"
                    type="number"
                    min={5}
                    step={5}
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-submit"
                style={{ marginTop: '12px' }}
                onClick={validarBloques}
                disabled={generando}
              >
                {generando ? 'Procesando...' : '⚡ Generar'}
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* ─── Modal: Resumen de Jornada ─── */}
      {showResumenJornada && (
        <div className="modal-overlay" onClick={() => setShowResumenJornada(false)}>
          <div className="modal-content jornada-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resumen de Jornada</h2>
              <p>Confirma los detalles antes de crear las reglas horarias en el sistema.</p>
            </div>
            <div className="modal-body">
              <div className="resumen-admin-box">
                <span className="resumen-admin-label">Veterinario</span>
                <span className="resumen-admin-valor">{vetSeleccionado?.nombreCompleto}</span>

                <span className="resumen-admin-label">Días Asignados</span>
                <span className="resumen-admin-valor">{getDiasSeleccionadosTexto()}</span>

                <span className="resumen-admin-label">Jornada Laboral</span>
                <span className="resumen-admin-valor">{horaInicio} hrs a {horaFin} hrs</span>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowResumenJornada(false)}>
                Modificar Datos
              </button>
              <button type="button" className="btn-submit" onClick={registrarJornada}>
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Confirmación de Agenda (bloques) ─── */}
      {showResumenBloques && (
        <div className="modal-overlay" onClick={() => setShowResumenBloques(false)}>
          <div className="modal-content jornada-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmación de Agenda</h2>
              <p>Verifica la configuración antes de generar los bloques en el sistema.</p>
            </div>
            <div className="modal-body">
              <div className="resumen-admin-box">
                <span className="resumen-admin-label">Profesional Médico</span>
                <span className="resumen-admin-valor">{vetSeleccionado?.nombreCompleto}</span>

                <span className="resumen-admin-label">Período de Bloques</span>
                <span className="resumen-admin-valor">{MESES[mes - 1]} de {anioSistema}</span>

                <span className="resumen-admin-label">Intervalo Clínico</span>
                <span className="resumen-admin-valor">Cada {duracion} minutos continuos</span>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowResumenBloques(false)}>
                Cancelar Ajustes
              </button>
              <button type="button" className="btn-submit" onClick={generarBloques}>
                Confirmar y Generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
