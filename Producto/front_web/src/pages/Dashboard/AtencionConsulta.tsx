import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import ArchivoAdjuntoUploader from '../../components/forms/ArchivoAdjuntoUploader';
import type { ArchivoEntry } from '../../components/forms/ArchivoAdjuntoUploader';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';

// Espejo web de RegistrarConsultaScreen móvil: registra la ficha clínica de la
// reserva atendida. Se llega desde la Agenda del Día con la reserva ya
// seleccionada (control de ingreso: "Sí, se presentó").

function parseIds(s: string): number[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x !== '')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

function mensajeError(err: any, fallback: string): string {
  const d = err?.response?.data;
  if (typeof d === 'string') return d;
  return d?.error || d?.mensaje || d?.message || fallback;
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  padding: '10px 12px',
  border: '1px solid #d0d5dd',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  resize: 'vertical',
};

export default function AtencionConsulta() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nombreUsuario = useNombreUsuario();

  // Datos de la reserva seleccionada en la Agenda del Día
  const idReserva = Number(params.get('reserva') || '');
  const mascota = params.get('mascota') || '';
  const tutor = params.get('tutor') || '';
  const hora = params.get('hora') || '';
  const reservaValida = Number.isInteger(idReserva) && idReserva > 0;

  const [notas, setNotas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [indicacionReceta, setIndicacionReceta] = useState('');

  const [examenesIds, setExamenesIds] = useState('');
  const [vacunasIds, setVacunasIds] = useState('');

  const [archivos, setArchivos] = useState<ArchivoEntry[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleCerrarConsulta = async () => {
    setError('');
    setOk('');
    if (!reservaValida) {
      setError('No hay una reserva seleccionada. Vuelve a la Agenda del Día y elige la cita que estás atendiendo.');
      return;
    }
    // Mismos campos obligatorios que el móvil
    if (!diagnostico.trim() || !indicacionReceta.trim()) {
      setError('Por favor, complete al menos el diagnóstico y la receta médica.');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post('/v1/consultas', {
        idReserva,
        asistio: true,
        notas: notas.trim() || null,
        diagnostico: diagnostico.trim() || null,
        indicacionReceta: indicacionReceta.trim() || null,
        vacunasIds: parseIds(vacunasIds),
        examenesIds: parseIds(examenesIds),
      });

      const idConsulta = resp.data?.idConsulta;

      const archivosValidos = archivos.filter((a) => a.archivoUrl.trim() !== '');
      let adjuntados = 0;
      for (const a of archivosValidos) {
        try {
          await api.post(`/v1/consultas/${idConsulta}/archivos`, {
            nomArchivo: a.nomArchivo.trim() || 'Documento',
            archivoUrl: a.archivoUrl.trim(),
            idTipoArchivo: a.idTipoArchivo,
          });
          adjuntados++;
        } catch {
        }
      }

      const detalleArchivos =
        archivosValidos.length > 0 ? ` Archivos adjuntados: ${adjuntados}/${archivosValidos.length}.` : '';
      alert(`La consulta médica ha sido guardada de forma exitosa en el historial del paciente.${detalleArchivos}`);
      navigate('/dashboard/medico');
    } catch (err) {
      setError(mensajeError(err, 'Ocurrió un problema al subir los datos al servidor.'));
    } finally {
      setLoading(false);
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
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard/medico/perfil')}>👤 Perfil</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/medico')}>🏠 Agenda del Día</button>
            <button className="nav-item active">🩺 Atender consulta</button>
          </nav>
        </aside>

        <main className="main-content">
          <section className="dashboard-section">
            <h2>Registrar Atención Médica</h2>
            <p style={{ color: '#555', marginTop: '-6px', marginBottom: '20px' }}>
              Registra la ficha clínica de la reserva atendida.
            </p>

            {error && <div className="error-message">{error}</div>}
            {ok && <div className="error-message" style={okStyle}>{ok}</div>}

            {!reservaValida ? (
              <div className="vets-empty">
                <span className="vets-empty-icon" aria-hidden>🩺</span>
                <p>
                  <strong>No hay una reserva seleccionada.</strong> Ve a tu Agenda del Día,
                  elige la cita que estás atendiendo y confirma el ingreso del paciente.
                </p>
                <button className="btn-submit" onClick={() => navigate('/dashboard/medico')}>
                  Ir a la Agenda del Día
                </button>
              </div>
            ) : (
              <>
                {/* Reserva en atención */}
                <div className="form-section">
                  <h3 className="form-section-title"><span className="step-badge">1</span>Reserva en atención</h3>
                  <div className="resumen-admin-box">
                    <span className="resumen-admin-label">Reserva</span>
                    <span className="resumen-admin-valor">#{idReserva}{hora ? ` · ${hora} hrs` : ''}</span>
                    {mascota && (
                      <>
                        <span className="resumen-admin-label">Paciente</span>
                        <span className="resumen-admin-valor">{mascota}</span>
                      </>
                    )}
                    {tutor && (
                      <>
                        <span className="resumen-admin-label">Tutor</span>
                        <span className="resumen-admin-valor">{tutor}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Diagnóstico y receta (obligatorios, como el móvil) */}
                <div className="form-section">
                  <h3 className="form-section-title"><span className="step-badge">2</span>Diagnóstico y receta</h3>
                  <div className="form-field" style={{ marginBottom: '14px' }}>
                    <label htmlFor="diagnostico">Diagnóstico Clínico *</label>
                    <textarea id="diagnostico" style={textareaStyle} placeholder="Ingrese la patología u observaciones del examen físico..." value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
                  </div>
                  <div className="form-field" style={{ marginBottom: '14px' }}>
                    <label htmlFor="receta">Indicación de Receta *</label>
                    <textarea id="receta" style={textareaStyle} placeholder="Medicamentos, posología, dosis y duración del tratamiento..." value={indicacionReceta} onChange={(e) => setIndicacionReceta(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="notas">Notas Adicionales / Privadas</label>
                    <textarea id="notas" style={textareaStyle} placeholder="Comentarios internos del box médico..." value={notas} onChange={(e) => setNotas(e.target.value)} />
                  </div>
                </div>

                {/* Exámenes y vacunas (opcional) */}
                <div className="form-section">
                  <h3 className="form-section-title"><span className="step-badge">3</span>Exámenes y vacunas (opcional)</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="examenes">IDs de exámenes</label>
                      <input id="examenes" type="text" placeholder="Ej. 1, 3" value={examenesIds} onChange={(e) => setExamenesIds(e.target.value)} />
                      <span className="field-hint">IDs separados por coma.</span>
                    </div>
                    <div className="form-field">
                      <label htmlFor="vacunas">IDs de vacunas</label>
                      <input id="vacunas" type="text" placeholder="Ej. 2" value={vacunasIds} onChange={(e) => setVacunasIds(e.target.value)} />
                      <span className="field-hint">IDs separados por coma.</span>
                    </div>
                  </div>
                </div>

                {/* Archivos adjuntos (opcional) */}
                <div className="form-section">
                  <h3 className="form-section-title"><span className="step-badge">4</span>Archivos adjuntos (opcional)</h3>
                  <ArchivoAdjuntoUploader archivos={archivos} onChange={setArchivos} />
                </div>

                <button type="button" className="btn-submit" style={{ marginTop: '8px' }} onClick={handleCerrarConsulta} disabled={loading}>
                  {loading ? 'Guardando consulta...' : 'Finalizar Consulta Médica'}
                </button>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
