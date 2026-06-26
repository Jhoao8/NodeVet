import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrecioCita, setPrecioCita, formatCLP } from '../../config/precioCita';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import '../../styles/Dashboard.css';

export default function ConfigPrecio() {
  const navigate = useNavigate();
  const nombreUsuario = useNombreUsuario();

  const [precio, setPrecio] = useState<string>(() => {
    const actual = getPrecioCita();
    return actual !== null ? String(actual) : '';
  });
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleGuardar = () => {
    setOk('');
    setError('');
    const n = Number(precio);
    if (precio.trim() === '' || !Number.isFinite(n) || n < 0) {
      setError('Ingresa un monto válido (número mayor o igual a 0).');
      return;
    }
    setPrecioCita(Math.round(n));
    setOk(`Precio guardado: ${formatCLP(Math.round(n))}.`);
  };

  const previewNum = Number(precio);
  const previewValido = precio.trim() !== '' && Number.isFinite(previewNum) && previewNum >= 0;

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
            <button className="nav-item" onClick={() => navigate('/dashboard/admin')}>👥 Usuarios</button>
            <button className="nav-item" onClick={() => navigate('/dashboard/admin/agenda')}>🗓️ Generar Agenda</button>
            <button className="nav-item active">💲 Valor de citas</button>
          </nav>
        </aside>

        <main className="main-content">
          <section className="dashboard-section">
            <h2>Valor de las citas</h2>
            <p style={{ color: '#555', marginTop: '-6px', marginBottom: '20px' }}>
              Define el valor que se muestra al tutor en el resumen de la reserva. Es informativo:
              no modifica el cobro real procesado por la pasarela de pago.
            </p>

            {error && <div className="error-message">{error}</div>}
            {ok && <div className="error-message" style={okStyle}>{ok}</div>}

            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">$</span>
                Precio de la cita
              </h3>
              <div className="form-grid">
                <div className="form-field span-2">
                  <label htmlFor="precio">Monto (CLP)</label>
                  <input
                    id="precio"
                    type="number"
                    min={0}
                    step={500}
                    placeholder="Ej. 15000"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                  />
                  <span className="field-hint">
                    {previewValido ? `Se mostrará como: ${formatCLP(Math.round(previewNum))}` : 'Ingresa el monto en pesos chilenos.'}
                  </span>
                </div>
              </div>
              <button type="button" className="btn-submit" style={{ marginTop: '12px' }} onClick={handleGuardar}>
                Guardar precio
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
