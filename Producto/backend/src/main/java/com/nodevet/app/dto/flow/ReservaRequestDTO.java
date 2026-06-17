package com.nodevet.app.dto.flow;

import lombok.Data;

@Data
public class ReservaRequestDTO {
    private Integer idMascota;
    private Integer idVet;
    private Integer idBloque;
    private Integer idValor;
}