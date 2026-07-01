package com.nodevet.app.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenTutorReservasDTO {
    private Integer idUsuario;
    private String nombreCompleto;
    private long reservasRealizadas;
    private long reservasAsistidas;
    private long reservasAusentadas;
}
