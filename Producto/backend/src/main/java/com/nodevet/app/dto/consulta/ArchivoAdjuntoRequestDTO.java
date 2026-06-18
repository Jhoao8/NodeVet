package com.nodevet.app.dto.consulta;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoAdjuntoRequestDTO {

    @Schema(example = "Radiografía Torax", description = "Nombre descriptivo del documento")
    private String nomArchivo;

    @Schema(example = "https://res.cloudinary.com/nodevet/image/upload/v12345/radio.png", description = "URL generada por Cloudinary o AWS S3")
    private String archivoUrl;

    @Schema(example = "1", description = "ID del tipo de archivo (ej: 1 para Imagen, 2 para PDF)")
    private Integer idTipoArchivo;
}