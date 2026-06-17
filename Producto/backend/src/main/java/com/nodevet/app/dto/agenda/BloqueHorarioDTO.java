package com.nodevet.app.dto.agenda;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloqueHorarioDTO {
    private Integer idBloque;
    private Integer idVet;
    private LocalDateTime fecHrInicio;
    private LocalDateTime fecHrFin;
}