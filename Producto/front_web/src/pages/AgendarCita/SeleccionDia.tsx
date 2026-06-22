import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/client';
import type { VetDisponibilidad, BloqueHorarioDTO, CitaSeleccionada } from '../../interfaces/Agenda';
import { getDashboardPath } from '../../utils/authUtils';
import '../../styles/AgendarCita.css';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const HORAS_ESTANDAR = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function formatearFechaLocal(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function horaDeBloque(iso: string): string {
  return iso.slice(11, 16);
}

interface SlotDia {
  hora: string;
  bloque: BloqueHorarioDTO | null;
}

export default function SeleccionDia() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [semanaActual, setSemanaActual] = useState(0);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [vets, setVets] = useState<VetDisponibilidad[]>([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState<string>('todas');
  const [vetSeleccionado, setVetSeleccionado] = useState<number | null>(null);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorarioDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fechas = useMemo(() => {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() + semanaActual * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const f = new Date(inicio);
      f.setDate(f.getDate() + i);
      return f;
    });
  }, [semanaActual]);

  const hoyStr = formatearFechaLocal(new Date());

  useEffect(() => {
    if (!fechaSeleccionada || !token) return;

    let cancelado = false;
    const cargarDisponibilidad = async () => {
      setLoading(true);
      setError('');
      setVets([]);
      setVetSeleccionado(null);
      setBloqueSeleccionado(null);
      try {
        const resp = await api.get<VetDisponibilidad[]>('/v1/agendas/disponibilidad', {
          params: { fecha: fechaSeleccionada },
        });
        if (!cancelado) setVets(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        if (!cancelado) {
          const msg = axios.isAxiosError(err)
            ? (typeof err.response?.data === 'string' ? err.response.data : 'No se pudo cargar la disponibilidad.')
            : 'No se pudo cargar la disponibilidad.';
          setError(msg);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargarDisponibilidad();
    return () => {
      cancelado = true;
    };
  }, [fechaSeleccionada, token]);

  const especialidades = useMemo(() => {
    const set = new Set(vets.map((v) => v.especialidad).filter(Boolean));
    return Array.from(set).sort();
  }, [vets]);

  const vetsFiltrados = useMemo(() => {
    if (especialidadFiltro === 'todas') return vets;
    return vets.filter((v) => v.especialidad === especialidadFiltro);
  }, [vets, especialidadFiltro]);

  const handleSeleccionarDia = (fecha: Date) => {
    const str = formatearFechaLocal(fecha);
    if (str < hoyStr) return;
    setFechaSeleccionada(str);
    setEspecialidadFiltro('todas');
  };

  const handleSeleccionarBloque = (idVet: number, bloque: BloqueHorarioDTO) => {
    setVetSeleccionado(idVet);
    setBloqueSeleccionado(bloque);
  };


  const construirSlots = (vet: VetDisponibilidad): SlotDia[] => {
    const disponiblesPorHora = new Map<string, BloqueHorarioDTO>();
    for (const b of vet.bloquesDisponibles) {
      disponiblesPorHora.set(horaDeBloque(b.fecHrInicio), b);
    }
    const horas = Array.from(new Set([...HORAS_ESTANDAR, ...disponiblesPorHora.keys()])).sort();
    return horas.map((hora) => ({ hora, bloque: disponiblesPorHora.get(hora) ?? null }));
  };

  const handleContinuar = () => {
    if (vetSeleccionado == null || !bloqueSeleccionado) {
      setError('Selecciona un veterinario y un bloque horario para continuar.');
      return;
    }
    const vet = vets.find((v) => v.idVet === vetSeleccionado);
    if (!vet) return;

    const cita: CitaSeleccionada = {
      idVet: vet.idVet,
      idBloque: bloqueSeleccionado.idBloque,
      nombreVet: vet.nombreCompleto,
      especialidad: vet.especialidad,
      fecha: fechaSeleccionada,
      hora: horaDeBloque(bloqueSeleccionado.fecHrInicio),
    };
    localStorage.setItem('citaSeleccionada', JSON.stringify(cita));
    navigate('/agendarCita/formulario');
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
          <h2>Agenda tu hora</h2>

          {}
          <div className="calendar-controls">
            <div className="nav-controls">
              <button onClick={() => setSemanaActual((s) => Math.max(0, s - 1))} disabled={semanaActual === 0}>←</button>
              <button onClick={() => setSemanaActual((s) => s + 1)}>→</button>
              <button onClick={() => setSemanaActual(0)}>Hoy</button>
            </div>
            <div className="week-indicator">
              {semanaActual === 0 ? 'Esta semana' : `En ${semanaActual} semana${semanaActual > 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="dia-picker">
            {fechas.map((fecha, idx) => {
              const str = formatearFechaLocal(fecha);
              const esPasado = str < hoyStr;
              const seleccionado = str === fechaSeleccionada;
              return (
                <div
                  key={idx}
                  className={`dia-card ${seleccionado ? 'selected' : ''} ${esPasado ? 'disabled' : ''}`}
                  onClick={() => handleSeleccionarDia(fecha)}
                >
                  <span className="day-name">{DIAS_SEMANA[fecha.getDay()].slice(0, 3)}</span>
                  <span className="day-number">{fecha.getDate()}</span>
                </div>
              );
            })}
          </div>

          {}
          {fechaSeleccionada && especialidades.length > 0 && (
            <div className="especialidad-group form-group">
              <label>Especialidad</label>
              <select value={especialidadFiltro} onChange={(e) => setEspecialidadFiltro(e.target.value)}>
                <option value="todas">Todas las especialidades</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
          )}

          {}
          <div className="disponibilidad-section">
            {error && <div className="error-message">{error}</div>}

            {!token ? (
              <p className="hint-text">Inicia sesión para ver la disponibilidad y agendar una hora.</p>
            ) : !fechaSeleccionada ? (
              <p className="hint-text">Selecciona un día para ver los veterinarios disponibles.</p>
            ) : loading ? (
              <p className="hint-text">Cargando disponibilidad...</p>
            ) : vetsFiltrados.length === 0 ? (
              <p className="hint-text">No hay veterinarios con horas disponibles para este día. Prueba con otra fecha.</p>
            ) : (
              vetsFiltrados.map((vet) => (
                <div className="vet-card" key={vet.idVet}>
                  <div className="vet-card-header">
                    <span className="vet-nombre">{vet.nombreCompleto}</span>
                    <span className="vet-especialidad">{vet.especialidad}</span>
                  </div>
                  <div className="bloques-grid">
                    {construirSlots(vet).map((slot) => {
                      const disponible = slot.bloque !== null;
                      const seleccionado =
                        disponible &&
                        vetSeleccionado === vet.idVet &&
                        bloqueSeleccionado?.idBloque === slot.bloque!.idBloque;
                      return (
                        <button
                          type="button"
                          key={`${vet.idVet}-${slot.hora}`}
                          className={`bloque-slot ${seleccionado ? 'selected' : ''} ${disponible ? '' : 'occupied'}`}
                          disabled={!disponible}
                          title={disponible ? 'Disponible' : 'Reservado / no disponible'}
                          onClick={() => disponible && handleSeleccionarBloque(vet.idVet, slot.bloque!)}
                        >
                          {slot.hora}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="btn-primary btn-lg"
            onClick={handleContinuar}
            disabled={!bloqueSeleccionado}
          >
            Continuar
          </button>
        </div>

        <div className="calendar-image"></div>
      </div>
    </div>
  );
}
