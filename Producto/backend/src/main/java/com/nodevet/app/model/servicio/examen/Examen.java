package com.nodevet.app.model.servicio.examen;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "EXAMEN")
public class Examen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_examen")
    private Integer idExamen;

    @Column(name = "nom_exam", nullable = false, length = 50)
    private String nomExam;

    @Column(name = "fec_exam", nullable = false)
    private LocalDate fecExam;

    @Column(name = "result_exam", nullable = false, columnDefinition = "TEXT")
    private String resultExam;

    @ManyToOne
    @JoinColumn(name = "id_tipo_exam", nullable = false)
    private TipoExamen tipoExamen;
}