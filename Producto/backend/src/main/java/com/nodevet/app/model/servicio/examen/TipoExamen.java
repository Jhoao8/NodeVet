package com.nodevet.app.model.servicio.examen;

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
@Table(name = "TIPO_EXAMEN")
public class TipoExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_exam")
    private Integer idTipoExam;

    @Column(name = "nom_tipo_exam", nullable = false, length = 50)
    private String nomTipoExam;
}