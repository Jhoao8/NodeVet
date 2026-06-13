package com.nodevet.app.dto.flow;

import lombok.Data;

@Data
public class PagoInitRequestDTO {
    // El frontend solo nos dirá: "Quiero pagar la reserva número X"
    // El backend se encargará de buscar en la BD cuánto cuesta esa reserva.
    private Long idReserva; 
}