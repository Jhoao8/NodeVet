package com.nodevet.app.dto.usuario;

import lombok.Data;

@Data
public class UsuarioUpdateDTO {
    private String nombreUsr;
    private String apellidoUsr;
    private String telefonoUsr;
    private String fotoUsr; // Opcional
}