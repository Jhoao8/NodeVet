// Espeja el ReservaResponseDTO del backend (GET /v1/reservas)
export interface Reserva {
  idReserva: number;
  idMascota: number;
  nombreMascota: string;
  idVet: number;
  nombreVeterinario: string;
  nombreTutor: string;
  fecHrInicio: string; // ISO LocalDateTime, ej. "2026-06-26T10:00:00"
  fecHrFin: string;
  idEstadoReserva: number;
  estadoReserva: string;
  monto: number;
  fecCreacion: string;
}
