import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/client';
import type { VetDisponibilidad, BloqueHorarioDTO } from '../../interfaces/Agenda';
import type { Mascota } from '../../components/PetCard/PetCard.types';
import { getDashboardPath } from '../../utils/authUtils';
import '../../styles/AgendarCita.css';

// Espejo web del flujo de agendamiento móvil (AgendarHoraScreen + ReservaModal):
// 1) elegir paciente, 2) elegir día en calendario mensual, 3) elegir hora en el
// acordeón de profesionales, 4) modal "Resumen de tu Cita", 5) modal
// "Confirmación de Pago" que redirige a la pasarela Flow.

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatearFechaLocal(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatearHora(fechaIso: string): string {
  if (!fechaIso) return '';
  return fechaIso.split('T')[1].substring(0, 5);
}

// "2026-07-12" → "12 de Julio del 2026" (mismo formato que el móvil)
function formatFechaEsp(fechaIso: string): string {
  if (!fechaIso) return '';
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia} de ${MESES[parseInt(mes) - 1]} del ${anio}`;
}

export default function AgendarHora() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const todayString = formatearFechaLocal(new Date());

  // Paciente
  const [pets, setPets] = useState<Mascota[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);

  // Calendario (igual que el móvil: parte en hoy y consulta de inmediato)
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [mesVisible, setMesVisible] = useState(() => {
    const d = new Date();
    return { anio: d.getFullYear(), mes: d.getMonth() };
  });

  // Disponibilidad
  const [profesionales, setProfesionales] = useState<VetDisponibilidad[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [profesionalExpandido, setProfesionalExpandido] = useState<number | null>(null);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorarioDTO | null>(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<VetDisponibilidad | null>(null);

  // Flujo de reserva (0 = oculto, 1 = resumen, 2 = confirmación de pago)
  const [reservaStep, setReservaStep] = useState(0);
  const [isProcessingPago, setIsProcessingPago] = useState(false);
  const [error, setError] = useState('');

  // Mascotas del tutor
  useEffect(() => {
    if (!token) {
      setLoadingPets(false);
      return;
    }
    let cancelado = false;
    api
      .get<Mascota[]>('/v1/mascotas')
      .then((resp) => {
        if (!cancelado) setPets(Array.isArray(resp.data) ? resp.data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setLoadingPets(false);
      });
    return () => {
      cancelado = true;
    };
    // 'token' NO va en las dependencias: el backend lo renueva en cada respuesta
    // (cabecera New-Token) y tenerlo aquí provocaba un bucle infinito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disponibilidad del día seleccionado
  useEffect(() => {
    if (!token) return;

    let cancelado = false;
    const cargar = async () => {
      setLoadingAgenda(true);
      setBloqueSeleccionado(null);
      setProfesionalSeleccionado(null);
      try {
        const resp = await api.get<VetDisponibilidad[]>('/v1/agendas/disponibilidad', {
          params: { fecha: selectedDate },
        });
        if (!cancelado) setProfesionales(Array.isArray(resp.data) ? resp.data : []);
      } catch {
        if (!cancelado) setProfesionales([]);
      } finally {
        if (!cancelado) setLoadingAgenda(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ─── Calendario mensual ───
  const esMesActual =
    mesVisible.anio === new Date().getFullYear() && mesVisible.mes === new Date().getMonth();

  const cambiarMes = (delta: number) => {
    setMesVisible((prev) => {
      const d = new Date(prev.anio, prev.mes + delta, 1);
      return { anio: d.getFullYear(), mes: d.getMonth() };
    });
  };

  const construirCeldas = (): (Date | null)[] => {
    const primerDia = new Date(mesVisible.anio, mesVisible.mes, 1);
    const diasEnMes = new Date(mesVisible.anio, mesVisible.mes + 1, 0).getDate();
    const celdas: (Date | null)[] = Array.from({ length: primerDia.getDay() }, () => null);
    for (let d = 1; d <= diasEnMes; d++) {
      celdas.push(new Date(mesVisible.anio, mesVisible.mes, d));
    }
    return celdas;
  };

  const handleSeleccionarDia = (fecha: Date) => {
    const str = formatearFechaLocal(fecha);
    if (str < todayString) return;
    setSelectedDate(str);
    setBloqueSeleccionado(null);
    setProfesionalSeleccionado(null);
  };

  // ─── Reserva y pago ───
  const handleContinuar = () => {
    if (!selectedPet || !bloqueSeleccionado) return;
    setError('');
    setReservaStep(1);
  };

  const handleEjecutarReservaYFlow = async () => {
    try {
      setIsProcessingPago(true);
      const payload = {
        idMascota: selectedPet!.idMascota,
        idVet: bloqueSeleccionado!.idVet,
        idBloque: bloqueSeleccionado!.idBloque,
        idValor: 1,
      };

      const resp = await api.post('/v1/reservas', payload);
      const urlPago: string | undefined = resp.data?.urlPago;

      if (urlPago) {
        // Adaptación web de Linking.openURL: Flow vuelve a /pago/resultado
        window.location.href = urlPago;
      } else {
        setError('No se pudo generar el enlace de pago. Intenta nuevamente.');
        setReservaStep(0);
      }
    } catch (err) {
      const mensaje =
        axios.isAxiosError(err) && typeof err.response?.data === 'string' && err.response.data
          ? err.response.data
          : 'El bloque horario fue seleccionado por otro usuario o error en validación de pago.';
      setError(mensaje);
      setReservaStep(0);
    } finally {
      setIsProcessingPago(false);
    }
  };

  return (
    <div className="agendar-cita-container">
      <header className="agendar-header">
        <div className="header-content">
          <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</h1>
          <nav className="nav-tabs">
            <button className="nav-tab" onClick={() => navigate(getDashboardPath())}>Dashboard</button>
          </nav>
          <div className="header-buttons">
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>Reserva Online</button>
            {token ? (
              <button className="btn-primary" onClick={() => navigate(getDashboardPath())}>Perfil</button>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/login')}>Ingresa</button>
            )}
          </div>
        </div>
      </header>

      <div className="agendar-content">
        <div className="calendar-section">
          <h2>Agendar Hora</h2>

          {error && <div className="error-message">{error}</div>}

          {!token ? (
            <p className="hint-text">
              Inicia sesión para ver la disponibilidad y agendar una hora.
            </p>
          ) : (
            <>
              {/* ─── Paciente ─── */}
              <div className="agendar-seccion">
                <span className="agendar-label">Paciente:</span>
                <button
                  type="button"
                  className="paciente-selector"
                  onClick={() => !loadingPets && pets.length > 0 && setShowPetModal(true)}
                  disabled={loadingPets || pets.length === 0}
                >
                  {loadingPets ? (
                    <span className="paciente-placeholder">Cargando mascotas...</span>
                  ) : pets.length === 0 ? (
                    <span className="paciente-error">Sin mascotas registradas</span>
                  ) : selectedPet ? (
                    <span className="paciente-nombre">{selectedPet.nomMascota}</span>
                  ) : (
                    <span className="paciente-placeholder">Seleccionar mascota...</span>
                  )}
                  <span aria-hidden>▾</span>
                </button>
              </div>

              {/* ─── Calendario ─── */}
              <div className="agendar-seccion">
                <span className="agendar-label">Seleccione día:</span>
                <div className="cal-wrapper">
                  <div className="cal-header">
                    <button
                      type="button"
                      className="cal-nav"
                      onClick={() => cambiarMes(-1)}
                      disabled={esMesActual}
                      aria-label="Mes anterior"
                    >
                      ‹
                    </button>
                    <span className="cal-mes">
                      {MESES[mesVisible.mes]} {mesVisible.anio}
                    </span>
                    <button
                      type="button"
                      className="cal-nav"
                      onClick={() => cambiarMes(1)}
                      aria-label="Mes siguiente"
                    >
                      ›
                    </button>
                  </div>
                  <div className="cal-grid">
                    {DIAS_CORTOS.map((d) => (
                      <span key={d} className="cal-dow">{d}</span>
                    ))}
                    {construirCeldas().map((fecha, idx) => {
                      if (!fecha) return <span key={`v-${idx}`} />;
                      const str = formatearFechaLocal(fecha);
                      const esPasado = str < todayString;
                      const seleccionado = str === selectedDate;
                      return (
                        <button
                          type="button"
                          key={str}
                          className={`cal-day ${seleccionado ? 'selected' : ''} ${esPasado ? 'disabled' : ''}`}
                          disabled={esPasado}
                          onClick={() => handleSeleccionarDia(fecha)}
                        >
                          {fecha.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ─── Profesionales disponibles ─── */}
              <div className="agendar-seccion">
                <span className="agendar-label">Profesionales disponibles:</span>

                {loadingAgenda ? (
                  <p className="hint-text">Buscando horarios...</p>
                ) : profesionales.length === 0 ? (
                  <p className="hint-text">No hay profesionales disponibles para esta fecha.</p>
                ) : (
                  profesionales.map((prof) => {
                    const isExpanded = profesionalExpandido === prof.idVet;
                    return (
                      <div key={prof.idVet} className="prof-card">
                        <button
                          type="button"
                          className="prof-header"
                          onClick={() =>
                            setProfesionalExpandido(isExpanded ? null : prof.idVet)
                          }
                        >
                          <span className="prof-left">
                            <span className="prof-avatar" aria-hidden>🩺</span>
                            <span className="prof-textos">
                              <span className="prof-nombre">{prof.nombreCompleto}</span>
                              <span className="prof-especialidad">{prof.especialidad}</span>
                            </span>
                          </span>
                          <span aria-hidden>{isExpanded ? '▴' : '▾'}</span>
                        </button>

                        {isExpanded && (
                          <div className="horas-grid">
                            {prof.bloquesDisponibles.map((bloque) => {
                              const isSelected =
                                bloqueSeleccionado?.idBloque === bloque.idBloque;
                              return (
                                <button
                                  type="button"
                                  key={bloque.idBloque}
                                  className={`hora-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    setBloqueSeleccionado(isSelected ? null : bloque);
                                    setProfesionalSeleccionado(isSelected ? null : prof);
                                  }}
                                >
                                  {formatearHora(bloque.fecHrInicio)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <button
                className="btn-primary btn-lg"
                onClick={handleContinuar}
                disabled={!selectedPet || !bloqueSeleccionado}
              >
                Continuar
              </button>
            </>
          )}
        </div>

        <div className="calendar-image"></div>
      </div>

      {/* ─── Modal: selección de paciente ─── */}
      {showPetModal && (
        <div className="reserva-modal-overlay" onClick={() => setShowPetModal(false)}>
          <div className="reserva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>Selecciona el paciente</h3>
              <button
                type="button"
                className="reserva-modal-close"
                onClick={() => setShowPetModal(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="reserva-modal-body">
              {pets.map((pet) => (
                <button
                  type="button"
                  key={pet.idMascota}
                  className="pet-row"
                  onClick={() => {
                    setSelectedPet(pet);
                    setShowPetModal(false);
                  }}
                >
                  {pet.imagenMascota ? (
                    <img className="pet-row-avatar" src={pet.imagenMascota} alt="" />
                  ) : (
                    <span className="pet-row-avatar pet-row-avatar--paw" aria-hidden>🐾</span>
                  )}
                  <span className="pet-row-textos">
                    <span className="pet-row-nombre">{pet.nomMascota}</span>
                    <span className="pet-row-sub">
                      {pet.especie} • {pet.raza || 'Sin raza'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: resumen (paso 1) y confirmación de pago (paso 2) ─── */}
      {reservaStep > 0 && (
        <div className="reserva-modal-overlay">
          <div className="reserva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>{reservaStep === 1 ? 'Resumen de tu Cita' : 'Confirmación de Pago'}</h3>
              {reservaStep === 1 && (
                <button
                  type="button"
                  className="reserva-modal-close"
                  onClick={() => setReservaStep(0)}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="reserva-modal-body">
              {reservaStep === 1 && (
                <>
                  <div className="resumen-box">
                    <div className="resumen-bloque">
                      <span className="resumen-etiqueta">🐾 Paciente:</span>
                      <span className="resumen-dato">{selectedPet?.nomMascota}</span>
                    </div>
                    <div className="resumen-bloque">
                      <span className="resumen-etiqueta">🩺 Profesional:</span>
                      <span className="resumen-dato">
                        {profesionalSeleccionado?.nombreCompleto}
                      </span>
                    </div>
                    <div className="resumen-bloque">
                      <span className="resumen-etiqueta">📅 Fecha:</span>
                      <span className="resumen-dato">{formatFechaEsp(selectedDate)}</span>
                    </div>
                    <div className="resumen-bloque">
                      <span className="resumen-etiqueta">🕐 Hora:</span>
                      <span className="resumen-dato">
                        {formatearHora(bloqueSeleccionado?.fecHrInicio || '')} hrs
                      </span>
                    </div>
                  </div>

                  <div className="reserva-botones">
                    <button
                      type="button"
                      className="reserva-btn-confirmar"
                      onClick={() => setReservaStep(2)}
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="reserva-btn-cancelar"
                      onClick={() => setReservaStep(0)}
                    >
                      Cancelar reserva
                    </button>
                  </div>
                </>
              )}

              {reservaStep === 2 && (
                <>
                  <div className="reserva-pago-icono" aria-hidden>💳</div>
                  <p className="reserva-pago-texto">
                    Serás redirigido de forma segura a la pasarela de pago Flow para
                    abonar la reserva de consulta de tu mascota.
                  </p>

                  <div className="reserva-botones">
                    <button
                      type="button"
                      className="reserva-btn-confirmar"
                      onClick={handleEjecutarReservaYFlow}
                      disabled={isProcessingPago}
                    >
                      {isProcessingPago ? 'Procesando...' : 'Pagar'}
                    </button>
                    <button
                      type="button"
                      className="reserva-btn-volver"
                      onClick={() => setReservaStep(1)}
                      disabled={isProcessingPago}
                    >
                      Volver
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
