package com.nodevet.app.dto.agenda;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JornadaRequestDTO {
    private Integer idVet;
    private Integer diaSemana; // 1=Lunes, 7=Domingo
    private LocalTime horaInicio; // Formato esperado: "09:00:00"
    private LocalTime horaFin;    // Formato esperado: "14:00:00"
}