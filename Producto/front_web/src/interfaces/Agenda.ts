// Tipos del flujo de agendamiento de horas médicas.
// Reflejan los DTOs del backend (VetDispDTO / BloqueHorarioDTO).

export interface BloqueHorarioDTO {
  idBloque: number;
  idVet: number;
  fecHrInicio: string; // LocalDateTime ISO sin zona, ej: "2026-06-20T09:00:00"
  fecHrFin: string;
}

export interface VetDisponibilidad {
  idVet: number;
  nombreCompleto: string;
  especialidad: string;
  bloquesDisponibles: BloqueHorarioDTO[];
}

// Selección que viaja desde SeleccionDia -> Formulario (persistida en localStorage).
export interface CitaSeleccionada {
  idVet: number;
  idBloque: number;
  nombreVet: string;
  especialidad: string;
  fecha: string; // YYYY-MM-DD (local)
  hora: string; // HH:mm
}
