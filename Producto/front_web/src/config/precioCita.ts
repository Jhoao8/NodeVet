const KEY = 'precioCitaCLP';

export function getPrecioCita(): number | null {
  const raw = localStorage.getItem(KEY);
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function setPrecioCita(valor: number): void {
  localStorage.setItem(KEY, String(valor));
}

export function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);
}
