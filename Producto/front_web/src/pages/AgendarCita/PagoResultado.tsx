import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/AgendarCita.css';

type Estado = 'exito' | 'pendiente' | 'rechazado';

// Página de retorno tras el pago en Flow (flow.return-url = /pago/resultado).
// La confirmación definitiva la realiza el backend vía webhook; aquí solo mostramos
// el resultado al usuario. Si Flow (o el flujo) entrega un parámetro de estado, lo
// respetamos; por defecto mostramos "Pago Exitoso".
const CONTENIDO: Record<Estado, { icono: string; titulo: string; mensaje: string; clase: string }> = {
  exito: {
    icono: '✅',
    titulo: '¡Pago Exitoso!',
    mensaje: 'Tu reserva fue confirmada. Te enviaremos los detalles de la cita a tu correo.',
    clase: 'exito',
  },
  pendiente: {
    icono: '⏳',
    titulo: 'Pago en proceso',
    mensaje: 'Estamos confirmando tu pago. En cuanto se acredite, tu reserva quedará confirmada.',
    clase: 'pendiente',
  },
  rechazado: {
    icono: '❌',
    titulo: 'Pago rechazado',
    mensaje: 'No pudimos procesar tu pago y la hora fue liberada. Puedes intentar agendar nuevamente.',
    clase: 'rechazado',
  },
};

export default function PagoResultado() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const estado: Estado = useMemo(() => {
    const raw = (params.get('estado') || params.get('status') || '').toLowerCase();
    if (raw === 'rechazado' || raw === 'failed' || raw === 'rejected') return 'rechazado';
    if (raw === 'pendiente' || raw === 'pending') return 'pendiente';
    return 'exito';
  }, [params]);

  const c = CONTENIDO[estado];

  return (
    <div className="agendar-cita-container">
      <header className="agendar-header">
        <div className="header-content">
          <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</h1>
        </div>
      </header>

      <div className="pago-resultado-wrapper">
        <div className={`pago-resultado-card ${c.clase}`}>
          <div className="pago-resultado-icono">{c.icono}</div>
          <h2>{c.titulo}</h2>
          <p>{c.mensaje}</p>
          <div className="pago-resultado-acciones">
            <button className="btn-primary" onClick={() => navigate('/dashboard/tutor')}>
              Ir a mi panel
            </button>
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>
              Agendar otra hora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
