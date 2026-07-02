package com.nodevet.app.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProximaCitaHomeDTO {
    private Integer idReserva;
    private String fecha;
    private String hora;
    private String mascota;
    private String fechaHoraInicio;
    private Boolean cancelable;
}
