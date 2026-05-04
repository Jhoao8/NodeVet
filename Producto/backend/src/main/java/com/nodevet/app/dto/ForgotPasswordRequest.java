package com.nodevet.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    // Al usar @Data de Lombok, no necesitas escribir los getters y setters manualmente
    private String correo_usr; 
}