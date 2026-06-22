import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';

const DIAS = [
  { n: 1, label: 'Lunes' },
  { n: 2, label: 'Martes' },
  { n: 3, label: 'Miércoles' },
  { n: 4, label: 'Jueves' },
  { n: 5, label: 'Viernes' },
  { n: 6, label: 'Sábado' },
  { n: 7, label: 'Domingo' },
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const hoy = new Date();

function mensajeError(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  return data?.mensaje || data?.error || data?.message || fallback;
}

export default function GenerarAgenda() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();

  const [idVet, setIdVet] = useState<string>(() => localStorage.getItem('ultimoVetIdVet') || '');

  const [diasSel, setDiasSel] = useState<number[]>([1, 2, 3, 4, 5]);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('18:00');

  const [anio, setAnio] = useState<number>(hoy.getFullYear());
  const [mes, setMes] = useState<number>(hoy.getMonth() + 1);
  const [duracion, setDuracion] = useState<number>(30);

  const [guardandoJornada, setGuardandoJornada] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const toggleDia = (n: number) => {
    setDiasSel((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n]));
  };

  const idVetNum = Number(idVet);
  const idVetValido = idVet.trim() !== '' && Number.isInteger(idVetNum) && idVetNum > 0;

  const handleGuardarJornada = async () => {
    setError('');
    setOk('');
    if (!idVetValido) {
      setError('Ingresa un ID de veterinario válido.');
      return;
    }
    if (diasSel.length === 0) {
      setError('Selecciona al menos un día laboral.');
      return;
    }
    if (horaInicio >= horaFin) {
      setError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    setGuardandoJornada(true);
    try {
      const resultados = await Promise.allSettled(
        diasSel.map((dia) =>
          api.post('/v1/jornadas', {
            idVet: idVetNum,
            diaSemana: dia,
            horaInicio,
            horaFin,
          }),
        ),
      );
      const fallidas = resultados.filter((r) => r.status === 'rejected');
      if (fallidas.length > 0) {
        const primera = fallidas[0] as PromiseRejectedResult;
        setError(mensajeError(primera.reason, `No se pudieron guardar ${fallidas.length} jornada(s).`));
      } else {
        setOk(`Jornada guardada para ${diasSel.length} día(s). Ahora puedes generar los bloques.`);
      }
    } finally {
      setGuardandoJornada(false);
    }
  };

  const handleGenerarBloques = async () => {
    setError('');
    setOk('');
    if (!idVetValido) {
      setError('Ingresa un ID de veterinario válido.');
      return;
    }
    if (!duracion || duracion <= 0) {
      setError('La duración debe ser mayor a 0 minutos.');
      return;
    }

    setGenerando(true);
    try {
      const resp = await api.post('/v1/agendas', null, {
        params: { idVet: idVetNum, anio, mes, duracionMinutos: duracion },
      });
      const cantidad = Array.isArray(resp.data) ? resp.data.length : 0;
      setOk(`Se generaron ${cantidad} bloque(s) para ${MESES[mes - 1]} ${anio}.`);
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron generar los bloques.'));
    } finally {
      setGenerando(false);
    }
  };

  const okStyle = { background: '#e6f4ea', color: '#1e4620', border: '1px solid #b7e1c4' } as const;

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
        {/* Sidebar (izquierda) */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard/admin')}>👥 Usuarios</button>
            <button className="nav-item active">🗓️ Generar Agenda</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/admin/precio')}>💲 Valor de citas</button>
          </nav>
        </aside>

        <main className="main-content">
          <section className="dashboard-section">
            <h2>Generar Agenda</h2>
            <p style={{ color: '#555', marginTop: '-6px', marginBottom: '20px' }}>
              Configura la jornada del veterinario y genera sus bloques de horario para un mes.
            </p>

            {error && <div className="error-message">{error}</div>}
            {ok && <div className="error-message" style={okStyle}>{ok}</div>}

            {/* Paso 1: Veterinario */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">1</span>
                Veterinario
              </h3>
              <div className="form-grid">
                <div className="form-field span-2">
                  <label htmlFor="idVet">ID del veterinario</label>
                  <input
                    id="idVet"
                    type="number"
                    min={1}
                    placeholder="Ej. 1"
                    value={idVet}
                    onChange={(e) => setIdVet(e.target.value)}
                  />
                  <span className="field-hint">
                    Es el ID del veterinario (no del usuario). Se muestra al crear un médico.
                  </span>
                </div>
              </div>
            </div>

            {/* Paso 2: Jornada */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">2</span>
                Jornada laboral
              </h3>
              <div className="checkbox-group" style={{ marginBottom: '14px' }}>
                {DIAS.map((d) => (
                  <label key={d.n}>
                    <input type="checkbox" checked={diasSel.includes(d.n)} onChange={() => toggleDia(d.n)} />
                    {d.label}
                  </label>
                ))}
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="horaInicio">Hora de inicio</label>
                  <input id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="horaFin">Hora de fin</label>
                  <input id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
                </div>
              </div>
              <button type="button" className="btn-submit" style={{ marginTop: '12px' }} onClick={handleGuardarJornada} disabled={guardandoJornada}>
                {guardandoJornada ? 'Guardando...' : 'Guardar jornada'}
              </button>
              <span className="field-hint" style={{ display: 'block', marginTop: '6px' }}>
                Guarda la jornada una sola vez por veterinario (repetir crea duplicados).
              </span>
            </div>

            {/* Paso 3: Generar bloques */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">3</span>
                Generar bloques
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="anio">Año</label>
                  <input id="anio" type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label htmlFor="mes">Mes</label>
                  <select id="mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field span-2">
                  <label htmlFor="duracion">Duración por bloque (minutos)</label>
                  <input id="duracion" type="number" min={5} step={5} value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} />
                </div>
              </div>
              <button type="button" className="btn-submit" style={{ marginTop: '12px' }} onClick={handleGenerarBloques} disabled={generando}>
                {generando ? 'Generando...' : 'Generar bloques'}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
