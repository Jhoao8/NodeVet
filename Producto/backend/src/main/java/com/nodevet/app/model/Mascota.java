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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor", nullable = false)
    private Tutor tutor;

    @Column(name = "nom_mascota", length = 50, nullable = false)
    private String nomMascota;

    @Column(length = 50, nullable = false)
    private String especie;

    @Column(length = 50)
    private String raza;

    @Column(name = "sexo")
    private Integer sexo; 

    @Column(name = "fec_nac")
    private LocalDate fecNac;

    @Builder.Default
    @Column(name = "est_fec_nac", nullable = false)
    private Integer estFecNac = 0;

    @Column(precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "imagen_mascota", columnDefinition = "TEXT")
    private String imagenMascota;

    @Builder.Default
    @Column(name = "estado_masc", nullable = false)
    private Integer estadoMasc = 1; 
}