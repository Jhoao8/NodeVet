package com.nodevet.app.dto.reserva;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReservaResponseDTO {
    private Integer idReserva;

    private Integer idMascota;
    private String nombreMascota;

    private Integer idVet;
    private String nombreVeterinario;

    private String nombreTutor;

    private LocalDateTime fecHrInicio;
    private LocalDateTime fecHrFin;

    private Integer idEstadoReserva;
    private String estadoReserva;

    private Integer monto;
    private LocalDateTime fecCreacion;
}
