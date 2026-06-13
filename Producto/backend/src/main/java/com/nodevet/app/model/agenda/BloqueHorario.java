package com.nodevet.app.model.agenda;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import com.nodevet.app.model.usuario.Veterinario;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vet", nullable = false)
    private Veterinario veterinario;

    // Relación con el estado del bloque (1 = Disponible, 2 = Ocupado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_est_bloque", nullable = false)
    private EstadoBloque estadoBloque;
    
}