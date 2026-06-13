package com.nodevet.app.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

import com.nodevet.app.dto.EspecialidadDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VeterinarioDTO {
    private Integer idVeterinario; // ID del perfil de Veterinario
    private Integer idUsuario; // ID del Usuario asociado (Integer, como en tu modelo actual)
    private String nombreCompleto;
    private String correoUsr;
    private String telefonoUsr;
    private Integer runVet;
    private String dvVet;
    private Set<EspecialidadDTO> especialidades;
}