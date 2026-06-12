package com.nodevet.app.dto.agenda;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JornadaDTO {
    private Integer idJornada;
    private Integer idVet;
    private Integer diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer estJornada;
}