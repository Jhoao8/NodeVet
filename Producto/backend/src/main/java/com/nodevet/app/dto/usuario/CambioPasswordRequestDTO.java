package com.nodevet.app.dto.usuario;

import lombok.Data;

@Data
public class CambioPasswordRequestDTO {
    private String passwordActual;
    private String nuevaPassword;
}
