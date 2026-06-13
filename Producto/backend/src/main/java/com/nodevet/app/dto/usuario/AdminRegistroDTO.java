package com.nodevet.app.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegistroDTO {
    // Datos para la entidad Usuario
    private String nombreUsr;
    private String apellidoUsr;
    private String correoUsr;
    private String passUsr;
    private String telefonoUsr;
    private String fotoUsr; // Opcional

    // Datos para la entidad Admin
    private String nivelAcceso; // Ej: "SUPER_ADMIN", "MODERADOR", etc.
}