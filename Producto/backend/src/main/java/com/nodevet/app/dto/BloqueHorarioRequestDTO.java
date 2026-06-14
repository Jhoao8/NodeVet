package com.nodevet.app.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BloqueHorarioRequestDTO {
    private LocalDateTime fecHrInicio;
    private LocalDateTime fecHrFin;
    private Integer idVet;
    private Integer idEstBloque;
}
