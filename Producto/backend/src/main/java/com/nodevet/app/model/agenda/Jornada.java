package com.nodevet.app.model.agenda;

import com.nodevet.app.model.Veterinario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "JORNADA")
public class Jornada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jornada")
    private Integer idJornada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vet", nullable = false)
    private Veterinario veterinario;

    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Builder.Default
    @Column(name = "est_jornada", nullable = false)
    private Integer estJornada = 1;
}