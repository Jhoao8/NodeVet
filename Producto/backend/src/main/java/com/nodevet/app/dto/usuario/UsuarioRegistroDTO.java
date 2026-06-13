package com.nodevet.app.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRegistroDTO {
    private String nombreUsr;
    private String apellidoUsr;
    private String correoUsr;
    private String passUsr;
    private String telefonoUsr;
    private String fotoUsr; // Opcional: URL de la foto de perfil

    // Nota: Campos como estadoUsr, fecCreacion y fecActualizacion no se incluyen aquí
    // porque son gestionados internamente por el servidor al crear el usuario.
}
