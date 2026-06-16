package com.nodevet.app.dto.agenda;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JornadaRequestDTO {

    @Schema(example = "1")
    private Integer idVet;

    @Schema(example = "1", description = "1=Lunes, 7=Domingo")
    private Integer diaSemana;

    @Schema(example = "09:00", type = "string")
    private LocalTime horaInicio;

    @Schema(example = "13:30", type = "string")
    private LocalTime horaFin;
}