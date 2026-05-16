import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AgendarCita.css';

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface CitaData {
  fecha: string;
  hora: string;
}

export default function SeleccionDia() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [semanaActual, setSemanaActual] = useState(0);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaData>({ fecha: '', hora: '' });
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana');

  const obtenerFechas = () => {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() + semanaActual * 7);

    const fechas = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(fecha.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };

  const fechas = obtenerFechas();
  const numeroSemana = 13;

  const handleSeleccionarHora = (fecha: Date, hora: string) => {
    setCitaSeleccionada({
      fecha: fecha.toISOString().split('T')[0],
      hora,
    });
  };

  const handleContinuar = () => {
    if (citaSeleccionada.fecha && citaSeleccionada.hora) {
      localStorage.setItem('citaSeleccionada', JSON.stringify(citaSeleccionada));
      navigate('/agendarCita/formulario');
    } else {
      alert('Por favor, selecciona una fecha y hora');
    }
  };

  return (
    <div className="agendar-cita-container">
      {/* Header */}
      <header className="agendar-header">
        <div className="header-content">
          <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</h1>
          <nav className="nav-tabs">
            <button className="nav-tab" onClick={() => navigate('/dashboard/tutor')}>Dashboard</button>
            <button className="nav-tab">Two</button>
            <button className="nav-tab">Three</button>
          </nav>
          <div className="header-buttons">
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>Reserva Online</button>
            {token ? (
              <button className="btn-primary" onClick={() => navigate('/dashboard/tutor')}>
                Perfil
              </button>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Ingresa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="agendar-content">
        <div className="calendar-section">
          <h2>Agenda tu hora</h2>

          {/* Calendar Controls */}
          <div className="calendar-controls">
            <div className="nav-controls">
              <button onClick={() => setSemanaActual(semanaActual - 1)}>←</button>
              <button onClick={() => setSemanaActual(semanaActual + 1)}>→</button>
              <button onClick={() => setSemanaActual(0)}>Hoy</button>
            </div>
            <div className="view-controls">
              <button
                className={vista === 'dia' ? 'active' : ''}
                onClick={() => setVista('dia')}
              >
                Día
              </button>
              <button
                className={vista === 'semana' ? 'active' : ''}
                onClick={() => setVista('semana')}
              >
                Semana
              </button>
              <button
                className={vista === 'mes' ? 'active' : ''}
                onClick={() => setVista('mes')}
              >
                Mes
              </button>
            </div>
            <div className="week-indicator">Semana {numeroSemana}</div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Day headers */}
            <div className="day-headers">
              {fechas.map((fecha, idx) => (
                <div key={idx} className="day-header">
                  <span className="day-name">{DIAS_SEMANA[fecha.getDay()]}</span>
                  <span className="day-number">{fecha.getDate()}</span>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="time-slots">
              {HORARIOS.map((hora) => (
                <div key={hora} className="time-row">
                  <div className="time-label">{hora}</div>
                  {fechas.map((fecha, dayIdx) => (
                    <div
                      key={`${fecha.toISOString()}-${hora}`}
                      className={`slot ${
                        citaSeleccionada.fecha === fecha.toISOString().split('T')[0] &&
                        citaSeleccionada.hora === hora
                          ? 'selected'
                          : ''
                      } ${Math.random() > 0.5 ? 'available' : 'occupied'}`}
                      onClick={() =>
                        handleSeleccionarHora(fecha, hora)
                      }
                    >
                      {Math.random() > 0.7 && <span className="mascota">[Mascota X]</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button className="btn-primary btn-lg" onClick={handleContinuar}>
            Continuar
          </button>
        </div>

        {/* Side Image */}
        <div className="calendar-image"></div>
      </div>
    </div>
  );
}
