package com.nodevet.app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MascotaRequestDTO {

    @NotBlank(message = "El nombre de la mascota es obligatorio")
    private String nomMascota;

    @NotBlank(message = "La especie es obligatoria")
    private String especie;

    private String raza;
    
    private Integer sexo;

    private LocalDate fecNac; // Para calcular la "Edad aprox"
    
    private Integer estFecNac;

    // VALIDACIÓN ESTRICTA: El peso debe ser mayor o igual a 0
    @DecimalMin(value = "0.0", message = "El peso no puede ser un valor negativo")
    private BigDecimal peso;

    private String imagenMascota;
}