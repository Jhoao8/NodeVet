// Tipos del módulo de administración de veterinarios.
// Reflejan los DTOs del backend (VeterinarioDTO / JornadaDTO), igual que el móvil.

import type { Especialidad } from './Especialidad';

export interface VeterinarioDTO {
  idVeterinario: number;
  idUsuario: number;
  nombreCompleto: string;
  correoUsr: string;
  telefonoUsr: string;
  runVet: number;
  dvVet: string;
  especialidades: Especialidad[];
  estadoUsr: number;
}

export interface JornadaDTO {
  idJornada: number;
  idVet: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  estJornada: number;
}

export const DIAS_SEMANA_MAP: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export function formatEspecialidades(especialidades?: Especialidad[]): string {
  if (!especialidades || especialidades.length === 0) return 'Sin especialidad';
  return especialidades.map((e) => e.nombre).join(', ');
}

export function getIniciales(nombreCompleto?: string): string {
  if (!nombreCompleto) return '?';
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
}
