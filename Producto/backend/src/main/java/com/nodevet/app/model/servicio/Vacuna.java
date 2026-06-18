package com.nodevet.app.model.servicio;

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
@Table(name = "VACUNA")
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vac")
    private Integer idVac;

    @Column(name = "nom_vacuna", nullable = false, length = 50)
    private String nomVacuna;

    @Column(name = "laboratorio", nullable = false, length = 20)
    private String laboratorio;

    @Column(name = "lote", nullable = false, length = 50)
    private String lote;

    @Column(name = "fecha_aplic", nullable = false)
    private LocalDate fechaAplic;

    @Column(name = "serie", nullable = false)
    private Integer serie;
}