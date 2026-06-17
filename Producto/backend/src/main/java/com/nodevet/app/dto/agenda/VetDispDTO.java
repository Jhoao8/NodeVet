package com.nodevet.app.dto.agenda;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VetDispDTO {
    private Integer idVet;
    private String nombreCompleto; // Ej: "Dr. Carlos Mendoza"
    private String especialidad;   // Ej: "Veterinario General"
    private List<BloqueHorarioDTO> bloquesDisponibles;
}
