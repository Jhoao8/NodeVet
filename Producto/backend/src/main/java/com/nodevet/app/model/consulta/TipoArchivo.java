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
@Table(name = "TIPO_ARCHIVO")
public class TipoArchivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_archivo")
    private Integer idTipoArchivo;

    @Column(name = "nom_tipo_archivo", nullable = false, length = 15)
    private String nomTipoArchivo;
}