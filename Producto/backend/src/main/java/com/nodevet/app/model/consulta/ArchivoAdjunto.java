package com.nodevet.app.model.consulta;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ARCHIVO_ADJUNTO")
public class ArchivoAdjunto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo_adjunto")
    private Integer idArchivoAdjunto;

    @Column(name = "nom_archivo", nullable = false, length = 255)
    private String nomArchivo;

    @Column(name = "archivo_url", nullable = false, length = 500)
    private String archivoUrl;

    @ManyToOne
    @JoinColumn(name = "id_consulta", nullable = false)
    private Consulta consulta;

    @ManyToOne
    @JoinColumn(name = "id_tipo_archivo", nullable = false)
    private TipoArchivo tipoArchivo;
}