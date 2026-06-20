package com.nodevet.app.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRegistroDTO {
    
    @NotBlank(message = "El nombre es obligatorio")
    private String nombreUsr;
    
    @NotBlank(message = "El apellido es obligatorio")
    private String apellidoUsr;
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato del correo no es válido")
    private String correoUsr;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String passUsr;
    
    @Size(max = 12, message = "El teléfono no puede exceder los 12 caracteres")
    private String telefonoUsr; // Es opcional según la BD, por eso no lleva @NotBlank
    
    private String fotoUsr; // Opcional: URL de la foto de perfil

    // Nota: Campos como estadoUsr, fecCreacion y fecActualizacion no se incluyen aquí
    // porque son gestionados internamente por el servidor al crear el usuario.
}