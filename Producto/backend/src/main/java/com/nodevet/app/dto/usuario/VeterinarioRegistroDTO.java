package com.nodevet.app.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VeterinarioRegistroDTO {
    // Datos para la entidad Usuario
    private String nombreUsr;
    private String apellidoUsr;
    private String correoUsr;
    private String passUsr;
    private String telefonoUsr;
    private String fotoUsr; // Opcional

    // Datos para la entidad Veterinario
    private Integer runVet;
    private String dvVet;

    // Lista de IDs de las especialidades a asociar
    private List<Long> especialidadesIds;
}