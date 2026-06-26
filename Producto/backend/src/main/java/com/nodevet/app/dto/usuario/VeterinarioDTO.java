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
    private Integer idVeterinario;
    private Integer idUsuario;
    private String nombreCompleto;
    private String correoUsr;
    private String telefonoUsr;
    private Integer runVet;
    private String dvVet;
    private Set<EspecialidadDTO> especialidades;
    private Integer estadoUsr; // ← campo agregado
}