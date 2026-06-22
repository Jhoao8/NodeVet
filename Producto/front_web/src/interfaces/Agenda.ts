// Tipos del flujo de agendamiento de horas médicas.
// Reflejan los DTOs del backend (VetDispDTO / BloqueHorarioDTO).

export interface BloqueHorarioDTO {
  idBloque: number;
  idVet: number;
  fecHrInicio: string;
  fecHrFin: string;
}

export interface VetDisponibilidad {
  idVet: number;
  nombreCompleto: string;
  especialidad: string;
  bloquesDisponibles: BloqueHorarioDTO[];
}

export interface CitaSeleccionada {
  idVet: number;
  idBloque: number;
  nombreVet: string;
  especialidad: string;
  fecha: string;
  hora: string;
}
