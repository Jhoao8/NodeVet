package com.nodevet.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BLOQUE_HORARIO")
public class BloqueHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloque")
    private Integer idBloque;

    @Column(name = "fec_hr_inicio", nullable = false)
    private LocalDateTime fecHrInicio;

    @Column(name = "fec_hr_fin", nullable = false)
    private LocalDateTime fecHrFin;

    @Column(name = "id_vet", nullable = false)
    private Integer idVet;

    @Builder.Default
    @Column(name = "id_est_bloque", nullable = false)
    private Integer idEstBloque = 1;
}
