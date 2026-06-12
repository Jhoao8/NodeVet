package com.nodevet.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {
    private Integer idAdmin; // ID del perfil de Admin
    private Integer idUsuario; // ID del Usuario asociado (Integer, como en tu modelo actual)
    private String nombreCompleto;
    private String correoUsr;
    private String telefonoUsr;
    private String nivelAcceso;
}