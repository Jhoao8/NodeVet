package com.nodevet.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // Lombok crea un constructor con todos los argumentos automaticamente
public class LoginResponseDTO {
    private String token;
}