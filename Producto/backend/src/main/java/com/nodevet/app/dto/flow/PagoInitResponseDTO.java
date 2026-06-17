package com.nodevet.app.dto.flow;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PagoInitResponseDTO {
    // Aquí le devolveremos al frontend la URL lista para que el usuario abra el navegador y pague
    private String urlPago; 
    private String token;
}