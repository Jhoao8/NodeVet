import type { Reserva } from '../interfaces/Reserva';

// Una cita es "próxima" si su inicio es ahora o en el futuro.
export function esProxima(r: Reserva): boolean {
  const t = new Date(r.fecHrInicio).getTime();
  return !isNaN(t) && t >= Date.now();
}

export function ordenarAsc(a: Reserva, b: Reserva): number {
  return new Date(a.fecHrInicio).getTime() - new Date(b.fecHrInicio).getTime();
}

export function ordenarDesc(a: Reserva, b: Reserva): number {
  return new Date(b.fecHrInicio).getTime() - new Date(a.fecHrInicio).getTime();
}

export function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatHora(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export function formatMonto(monto: number): string {
  if (monto == null || isNaN(monto)) return '';
  return `$${monto.toLocaleString('es-CL')}`;
}

// Devuelve un sufijo de clase CSS según el nombre del estado de la reserva.
export function claseEstado(estado: string): string {
  const e = (estado || '').toLowerCase();
  if (e.includes('pend')) return 'pendiente';
  if (e.includes('confirm')) return 'confirmada';
  if (e.includes('complet')) return 'completada';
  if (e.includes('cancel') || e.includes('anul') || e.includes('rechaz')) return 'cancelada';
  return 'otro';
}
