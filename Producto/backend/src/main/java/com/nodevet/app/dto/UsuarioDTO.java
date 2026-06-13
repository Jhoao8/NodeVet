package com.nodevet.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Integer idUsuario;
    private String nombreCompleto;
    private String correoUsr;
    private String telefonoUsr;
    private String fotoUsr;
    private Integer estadoUsr;
}