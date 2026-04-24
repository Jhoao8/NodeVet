package com.nodevet.app.dto;

import lombok.Data;

@Data
public class UsuarioRegistroDTO {
    
    private String nombreUsr;
    private String apellidoUsr;
    private String correoUsr;
    private String passUsr;
    private String telefonoUsr;
    // No incluimos ID, fecha de creacion ni estado porque eso 
    // lo maneja el backend internamente al registrar.
}