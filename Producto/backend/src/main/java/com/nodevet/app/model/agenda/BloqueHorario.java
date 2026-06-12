package com.nodevet.app.model.agenda;

import com.nodevet.app.model.Veterinario;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vet", nullable = false)
    private Veterinario veterinario;

    @Column(name = "fec_hr_inicio", nullable = false)
    private LocalDateTime fecHrInicio;

    @Column(name = "fec_hr_fin", nullable = false)
    private LocalDateTime fecHrFin;
}