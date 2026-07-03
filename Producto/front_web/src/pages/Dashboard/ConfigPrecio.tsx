import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { getPrecioCita, setPrecioCita, formatCLP } from '../../config/precioCita';
import { useNombreUsuario } from '../../hooks/useNombreUsuario';
import UserMenu from '../../components/UserMenu';
import AdminSidebar from '../../components/AdminSidebar';
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

  // Switch de pago obligatorio (espejo del AdminHomeScreen móvil)
  const [pagoObligatorio, setPagoObligatorio] = useState<boolean | null>(null);
  const [savingPagoConfig, setSavingPagoConfig] = useState(false);

  useEffect(() => {
    let cancelado = false;
    api
      .get('/v1/pagos/config/obligatorio')
      .then((resp) => {
        if (!cancelado) setPagoObligatorio(Boolean(resp.data?.pagoObligatorio));
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const togglePagoObligatorio = async () => {
    if (pagoObligatorio === null) return;
    setSavingPagoConfig(true);
    setError('');
    try {
      const resp = await api.put('/v1/pagos/config/obligatorio', {
        pagoObligatorio: !pagoObligatorio,
      });
      setPagoObligatorio(Boolean(resp.data?.pagoObligatorio));
    } catch {
      setError('No se pudo actualizar la configuración de pago.');
    } finally {
      setSavingPagoConfig(false);
    }
  };

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
        <AdminSidebar active="precio" />

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

            {/* Módulo de pagos Flow: pago obligatorio para reservar */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">💳</span>
                Módulo de Pagos (Flow)
              </h3>
              <p className="field-hint" style={{ display: 'block', marginBottom: '12px' }}>
                Si el pago es obligatorio, el tutor deberá pagar en la pasarela para
                confirmar su reserva. Si está desactivado, las reservas se confirman
                directamente sin pago.
              </p>

              {pagoObligatorio === null ? (
                <span className="field-hint">Cargando configuración...</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className={`status ${pagoObligatorio ? 'active' : 'inactive'}`}>
                    {pagoObligatorio ? 'Pago obligatorio: ON' : 'Pago obligatorio: OFF'}
                  </span>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={togglePagoObligatorio}
                    disabled={savingPagoConfig}
                  >
                    {savingPagoConfig
                      ? 'Guardando...'
                      : pagoObligatorio
                        ? 'Desactivar pago obligatorio'
                        : 'Activar pago obligatorio'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
