package com.nodevet.app.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VeterinarioRegistroDTO {
    
    // Datos para la entidad Usuario
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
    private String telefonoUsr;
    
    private String fotoUsr; // Opcional

    // Datos para la entidad Veterinario
    @NotNull(message = "El RUN del veterinario es obligatorio")
    private Integer runVet;
    
    @NotBlank(message = "El dígito verificador es obligatorio")
    @Size(max = 1, message = "El dígito verificador debe ser de 1 carácter")
    private String dvVet;

    @NotNull(message = "La lista de especialidades no puede ser nula")
    @NotEmpty(message = "Debe asignar al menos una especialidad al veterinario")
    private List<Long> especialidadesIds;
}