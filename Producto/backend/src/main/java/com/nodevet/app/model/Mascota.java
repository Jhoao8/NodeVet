package com.nodevet.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "MASCOTA")
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mascota")
    private Integer idMascota;

    // Aquí está la relación con el Tutor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor", nullable = false)
    private Tutor tutor;

    @Column(name = "nom_mascota", length = 50, nullable = false)
    private String nomMascota;

    @Column(length = 50, nullable = false)
    private String especie;

    @Column(length = 50)
    private String raza;

    @Column(length = 1)
    private String sexo;

    @Column(name = "fec_nac")
    private LocalDate fecNac;

    @Builder.Default
    @Column(name = "est_fec_nac", nullable = false)
    private Integer estFecNac = 0; // 1 si es estimada, 0 si es exacta

    @Column(precision = 5, scale = 2)
    private BigDecimal peso;

    @Builder.Default
    @Column(name = "estado_masc", nullable = false)
    private Integer estadoMasc = 1; // Para el Soft Delete a futuro
}