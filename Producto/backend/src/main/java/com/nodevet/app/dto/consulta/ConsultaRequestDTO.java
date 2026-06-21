package com.nodevet.app.dto.consulta;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List; // <-- No olvides importar List

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaRequestDTO {

    @Schema(example = "1", description = "ID de la reserva confirmada a la que pertenece esta consulta")
    private Integer idReserva;

    @Schema(example = "1", description = "ID del valor o costo asociado a la atención")
    private Integer idValor;

    @Schema(example = "El paciente presenta decaimiento y falta de apetito desde hace 2 días.", type = "string")
    private String notas;

    @Schema(example = "Gastroenteritis de origen alimentario.", type = "string")
    private String diagnostico;

    @Schema(example = "Administrar viadil gotas cada 8 horas. Dieta blanda por 3 días.", type = "string")
    private String indicacionReceta;

    // --- NUEVOS CAMPOS PARA SERVICIOS ---
    
    @Schema(example = "[1, 2]", description = "Lista de IDs de las vacunas aplicadas (opcional)")
    private List<Integer> vacunasIds;

    @Schema(example = "[1]", description = "Lista de IDs de los exámenes realizados (opcional)")
    private List<Integer> examenesIds;
}