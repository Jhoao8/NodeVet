import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import ArchivoAdjuntoUploader from '../../components/forms/ArchivoAdjuntoUploader';
import type { ArchivoEntry } from '../../components/forms/ArchivoAdjuntoUploader';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';

// Valor (costo) por defecto; no hay endpoint para listarlos, igual que en reservas.
const ID_VALOR_PLACEHOLDER = 1;

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

  const [idReserva, setIdReserva] = useState<string>(params.get('reserva') || '');
  const [idValor, setIdValor] = useState<string>(String(ID_VALOR_PLACEHOLDER));

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

  const idReservaNum = Number(idReserva);
  const idReservaValido = idReserva.trim() !== '' && Number.isInteger(idReservaNum) && idReservaNum > 0;

  const handleCerrarConsulta = async () => {
    setError('');
    setOk('');

    // Validaciones (criterio de aceptación: no permitir consulta vacía)
    if (!idReservaValido) {
      setError('Ingresa el ID de la reserva que estás atendiendo.');
      return;
    }
    if (!diagnostico.trim() && !notas.trim() && !indicacionReceta.trim()) {
      setError('No puedes cerrar una consulta vacía: ingresa al menos el diagnóstico, las notas o la receta.');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post('/v1/consultas', {
        idReserva: idReservaNum,
        idValor: Number(idValor) || ID_VALOR_PLACEHOLDER,
        notas: notas.trim() || null,
        diagnostico: diagnostico.trim() || null,
        indicacionReceta: indicacionReceta.trim() || null,
        vacunasIds: parseIds(vacunasIds),
        examenesIds: parseIds(examenesIds),
      });

      const idConsulta = resp.data?.idConsulta;

      // Adjuntar archivos (solo los que tienen URL) una vez creada la ficha
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
          // Si un archivo falla, no abortamos la consulta ya creada; lo informamos.
        }
      }

      const detalleArchivos =
        archivosValidos.length > 0 ? ` Archivos adjuntados: ${adjuntados}/${archivosValidos.length}.` : '';
      setOk(`Consulta cerrada exitosamente (ID ${idConsulta}).${detalleArchivos}`);

      // Limpiar el formulario para la siguiente atención
      setNotas('');
      setDiagnostico('');
      setIndicacionReceta('');
      setExamenesIds('');
      setVacunasIds('');
      setArchivos([]);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cerrar la consulta.'));
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
            <button className="nav-item" onClick={() => navigate('/dashboard/medico')}>🏠 Inicio</button>
            <button className="nav-item active">🩺 Atender consulta</button>
          </nav>
        </aside>

        <main className="main-content">
          <section className="dashboard-section">
            <h2>Atención de consulta</h2>
            <p style={{ color: '#555', marginTop: '-6px', marginBottom: '20px' }}>
              Registra la ficha clínica de la reserva atendida. Requiere una reserva pagada/confirmada.
            </p>

            {error && <div className="error-message">{error}</div>}
            {ok && <div className="error-message" style={okStyle}>{ok}</div>}

            {/* Paso 1: Reserva */}
            <div className="form-section">
              <h3 className="form-section-title"><span className="step-badge">1</span>Reserva</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="idReserva">ID de la reserva</label>
                  <input id="idReserva" type="number" min={1} placeholder="Ej. 5" value={idReserva} onChange={(e) => setIdReserva(e.target.value)} />
                  <span className="field-hint">ID de la reserva que estás atendiendo (debe estar pagada).</span>
                </div>
                <div className="form-field">
                  <label htmlFor="idValor">ID del valor</label>
                  <input id="idValor" type="number" min={1} value={idValor} onChange={(e) => setIdValor(e.target.value)} />
                  <span className="field-hint">Costo asociado (por defecto 1).</span>
                </div>
              </div>
            </div>

            {/* Paso 2: Atención (diagnóstico / receta) */}
            <div className="form-section">
              <h3 className="form-section-title"><span className="step-badge">2</span>Diagnóstico y receta</h3>
              <div className="form-field" style={{ marginBottom: '14px' }}>
                <label htmlFor="diagnostico">Diagnóstico</label>
                <textarea id="diagnostico" style={textareaStyle} placeholder="Ej. Gastroenteritis de origen alimentario." value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
              </div>
              <div className="form-field" style={{ marginBottom: '14px' }}>
                <label htmlFor="notas">Notas de la atención</label>
                <textarea id="notas" style={textareaStyle} placeholder="Ej. El paciente presenta decaimiento desde hace 2 días." value={notas} onChange={(e) => setNotas(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="receta">Indicaciones / receta</label>
                <textarea id="receta" style={textareaStyle} placeholder="Ej. Viadil gotas cada 8 horas. Dieta blanda por 3 días." value={indicacionReceta} onChange={(e) => setIndicacionReceta(e.target.value)} />
              </div>
            </div>

            {/* Paso 3: Exámenes y vacunas */}
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

            {/* Paso 4: Archivos adjuntos */}
            <div className="form-section">
              <h3 className="form-section-title"><span className="step-badge">4</span>Archivos adjuntos (opcional)</h3>
              <ArchivoAdjuntoUploader archivos={archivos} onChange={setArchivos} />
            </div>

            <button type="button" className="btn-submit" style={{ marginTop: '8px' }} onClick={handleCerrarConsulta} disabled={loading}>
              {loading ? 'Cerrando consulta...' : 'Cerrar consulta'}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
