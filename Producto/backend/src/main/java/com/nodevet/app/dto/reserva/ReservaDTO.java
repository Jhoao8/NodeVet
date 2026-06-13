package com.nodevet.app.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaDTO {
    private Integer idReserva;
    private Integer idMascota;
    private Integer idVet;
    private Integer idBloque;
    private Integer idValor;
    private Integer idEstReserva;
    private LocalDateTime fecCreacion;
}