package com.nodevet.app.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaVetDiaDTO {
    private Integer idReserva;
    private String hora;
    private String tutor;
    private String mascota;
}
