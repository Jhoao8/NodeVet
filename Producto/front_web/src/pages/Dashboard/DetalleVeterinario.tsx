import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/client';
import AdminSidebar from '../../components/AdminSidebar';
import UserMenu from '../../components/UserMenu';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import {
  DIAS_SEMANA_MAP,
  formatEspecialidades,
  getIniciales,
} from '../../interfaces/Veterinario';
import type { VeterinarioDTO, JornadaDTO } from '../../interfaces/Veterinario';
import '../../styles/Dashboard.css';

// "09:00:00" → "09:00"
function limpiarFormatoHora(hora: string): string {
  if (!hora) return '00:00';
  const partes = hora.split(':');
  return partes.length >= 2 ? `${partes[0]}:${partes[1]}` : hora;
}

function mensajeError(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (typeof data === 'string' && data) return data;
  return data?.mensaje || data?.error || data?.message || fallback;
}

// Espejo web de DetalleVetScreen + VerJornadaScreen del móvil: ficha del
// veterinario, gestión horaria (jornadas base con edición) y desactivación.
export default function DetalleVeterinario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const nombreUsuario = useNombreUsuario();

  const vetInicial = (location.state as any)?.vet as VeterinarioDTO | undefined;

  const [vet, setVet] = useState<VeterinarioDTO | null>(vetInicial ?? null);
  const [loadingVet, setLoadingVet] = useState(!vetInicial);

  const [jornadas, setJornadas] = useState<JornadaDTO[]>([]);
  const [loadingJornadas, setLoadingJornadas] = useState(true);

  const [jornadaEditando, setJornadaEditando] = useState<JornadaDTO | null>(null);
  const [editHoraInicio, setEditHoraInicio] = useState('');
  const [editHoraFin, setEditHoraFin] = useState('');
  const [guardandoJornada, setGuardandoJornada] = useState(false);

  const [desactivando, setDesactivando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Si llegamos sin el veterinario en el estado (ej. recarga), lo buscamos por id.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    if (vet || !id) return;

    let cancelado = false;
    api
      .get<VeterinarioDTO[]>('/v1/veterinarios')
      .then((resp) => {
        if (cancelado) return;
        const encontrado = resp.data.find((v) => v.idVeterinario === Number(id));
        setVet(encontrado ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setLoadingVet(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, vet, navigate]);

  // Jornadas base del veterinario (espejo de VerJornadaScreen)
  useEffect(() => {
    if (!id) return;

    let cancelado = false;
    setLoadingJornadas(true);
    api
      .get<JornadaDTO[]>(`/v1/jornadas/veterinario/${id}`)
      .then((resp) => {
        if (cancelado) return;
        const ordenadas = [...resp.data].sort((a, b) => a.diaSemana - b.diaSemana);
        setJornadas(ordenadas);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudieron recuperar las reglas horarias de este veterinario.');
      })
      .finally(() => {
        if (!cancelado) setLoadingJornadas(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const formatTimeInput = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    return cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
  };

  const isValidTime = (timeString: string): boolean =>
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);

  const abrirEdicionJornada = (jornada: JornadaDTO) => {
    setError('');
    setExito('');
    setJornadaEditando(jornada);
    setEditHoraInicio(limpiarFormatoHora(jornada.horaInicio));
    setEditHoraFin(limpiarFormatoHora(jornada.horaFin));
  };

  const cerrarEdicionJornada = () => {
    setJornadaEditando(null);
    setEditHoraInicio('');
    setEditHoraFin('');
  };

  const guardarJornada = async () => {
    if (!jornadaEditando) return;
    if (!isValidTime(editHoraInicio) || !isValidTime(editHoraFin)) {
      setError('Las horas deben tener un formato válido (HH:MM).');
      cerrarEdicionJornada();
      return;
    }

    setGuardandoJornada(true);
    try {
      const payload = {
        idVet: jornadaEditando.idVet,
        diaSemana: jornadaEditando.diaSemana,
        horaInicio: editHoraInicio,
        horaFin: editHoraFin,
      };
      const resp = await api.put<JornadaDTO>(`/v1/jornadas/${jornadaEditando.idJornada}`, payload);
      const actualizada = resp.data;

      setJornadas((prev) =>
        prev.map((j) => (j.idJornada === actualizada.idJornada ? actualizada : j)),
      );
      setExito(
        `El horario del ${DIAS_SEMANA_MAP[actualizada.diaSemana]} fue modificado exitosamente.`,
      );
      cerrarEdicionJornada();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el nuevo horario.'));
      cerrarEdicionJornada();
    } finally {
      setGuardandoJornada(false);
    }
  };

  const handleDesactivar = async () => {
    if (!vet) return;
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas desactivar a ${vet.nombreCompleto}? Esta acción lo ocultará del sistema.`,
    );
    if (!confirmar) return;

    setDesactivando(true);
    setError('');
    try {
      await api.delete(`/v1/usuarios/${vet.idUsuario}`);
      alert('La cuenta ha sido desactivada exitosamente.');
      navigate('/dashboard/admin/veterinarios');
    } catch {
      setError('No se pudo desactivar al veterinario.');
    } finally {
      setDesactivando(false);
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
        <AdminSidebar active="veterinarios" />

        <main className="main-content">
          <button
            className="admin-back"
            onClick={() => navigate('/dashboard/admin/veterinarios')}
          >
            ← Volver a veterinarios
          </button>

          {loadingVet ? (
            <section className="dashboard-section">
              <div className="loading">Cargando veterinario...</div>
            </section>
          ) : !vet ? (
            <section className="dashboard-section">
              <p className="hint-text">No se encontró el veterinario solicitado.</p>
            </section>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}
              {exito && <div className="success-message">{exito}</div>}

              {/* ─── Ficha del veterinario ─── */}
              <section className="dashboard-section">
                <h2>Detalle del Veterinario</h2>

                <div className="vet-ficha-head">
                  <span className="vet-row-avatar vet-ficha-avatar">
                    {getIniciales(vet.nombreCompleto)}
                  </span>
                  <div>
                    <h3 className="vet-ficha-nombre">{vet.nombreCompleto}</h3>
                    <span className={`status ${vet.estadoUsr === 1 ? 'active' : 'inactive'}`}>
                      {vet.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <dl className="vet-ficha-grid">
                  <div className="vet-info-item">
                    <dt>📧 Correo Institucional</dt>
                    <dd>{vet.correoUsr}</dd>
                  </div>
                  <div className="vet-info-item">
                    <dt>📞 Teléfono</dt>
                    <dd>{vet.telefonoUsr || 'No registrado'}</dd>
                  </div>
                  <div className="vet-info-item">
                    <dt>🪪 RUT / RUN</dt>
                    <dd>{vet.runVet}-{vet.dvVet}</dd>
                  </div>
                  <div className="vet-info-item">
                    <dt>🩺 Especialidades</dt>
                    <dd>{formatEspecialidades(vet.especialidades)}</dd>
                  </div>
                </dl>
              </section>

              {/* ─── Gestión Horaria ─── */}
              <section className="dashboard-section">
                <h3>Gestión Horaria</h3>

                <div className="vet-acciones-horario">
                  <button
                    className="btn-submit"
                    onClick={() => navigate('/dashboard/admin/agenda', { state: { vet } })}
                  >
                    🗓️ Configurar Jornada y Bloques
                  </button>
                </div>

                <h4 className="jornadas-subtitulo">Jornadas Base Asignadas</h4>

                {loadingJornadas ? (
                  <div className="loading">Cargando jornadas...</div>
                ) : jornadas.length === 0 ? (
                  <div className="vets-empty">
                    <span className="vets-empty-icon" aria-hidden>🗓️</span>
                    <p>
                      <strong>Sin reglas asignadas.</strong> Este profesional no registra un molde
                      horario base en el sistema. Puedes configurarle uno con "Configurar Jornada y Bloques".
                    </p>
                  </div>
                ) : (
                  <ul className="jornadas-list">
                    {jornadas.map((jornada) => (
                      <li key={jornada.idJornada} className="jornada-card">
                        <div className="jornada-info">
                          <span className="jornada-dia">
                            🗓️ {DIAS_SEMANA_MAP[jornada.diaSemana]}
                          </span>
                          <span className="jornada-horas">
                            🕐 {limpiarFormatoHora(jornada.horaInicio)} hrs a{' '}
                            {limpiarFormatoHora(jornada.horaFin)} hrs
                          </span>
                        </div>
                        <button
                          className="btn-row edit"
                          onClick={() => abrirEdicionJornada(jornada)}
                        >
                          ✎ Editar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ─── Administración de Cuenta ─── */}
              <section className="dashboard-section">
                <h3>Administración de Cuenta</h3>
                <button
                  className="btn-desactivar-vet"
                  onClick={handleDesactivar}
                  disabled={desactivando}
                >
                  {desactivando ? 'Desactivando...' : '⏻ Desactivar Veterinario'}
                </button>
              </section>
            </>
          )}
        </main>
      </div>

      {/* ─── Modal: editar jornada (espejo del formulario móvil) ─── */}
      {jornadaEditando && (
        <div className="modal-overlay" onClick={cerrarEdicionJornada}>
          <div className="modal-content jornada-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Jornada</h2>
              <p>{DIAS_SEMANA_MAP[jornadaEditando.diaSemana]}</p>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="edit-hora-inicio">Hora Inicio</label>
                  <input
                    id="edit-hora-inicio"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="09:00"
                    value={editHoraInicio}
                    onChange={(e) => setEditHoraInicio(formatTimeInput(e.target.value))}
                    disabled={guardandoJornada}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-hora-fin">Hora Fin</label>
                  <input
                    id="edit-hora-fin"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="14:00"
                    value={editHoraFin}
                    onChange={(e) => setEditHoraFin(formatTimeInput(e.target.value))}
                    disabled={guardandoJornada}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={cerrarEdicionJornada}
                disabled={guardandoJornada}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={guardarJornada}
                disabled={guardandoJornada}
              >
                {guardandoJornada ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
