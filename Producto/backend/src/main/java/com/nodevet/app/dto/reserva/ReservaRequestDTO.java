package com.nodevet.app.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaRequestDTO {
    private Integer idMascota;
    private Integer idVet;
    private Integer idBloque;
    private Integer idValor;
}