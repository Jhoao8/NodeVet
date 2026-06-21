package com.nodevet.app.dto.consulta;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ConsultaResponseDTO {
    private Integer idConsulta;
    private Integer idReserva;
    private String diagnostico;
    private String notas;
    private String indicacionReceta;
    private List<String> archivosUrls; 
}