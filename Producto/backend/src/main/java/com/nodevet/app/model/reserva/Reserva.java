package com.nodevet.app.model.reserva;

import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.Valor;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.model.usuario.Veterinario;

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
@Table(name = "RESERVA")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Integer idReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vet", nullable = false)
    private Veterinario veterinario;

    // Relación 1 a 1: Un bloque de tiempo específico solo puede tener una reserva
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bloque", nullable = false, unique = true)
    private BloqueHorario bloqueHorario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_valor", nullable = false)
    private Valor valor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_est_res", nullable = false)
    private EstadoReserva estadoReserva;

    @Column(name = "fec_creacion", nullable = false, updatable = false)
    private LocalDateTime fecCreacion;

    @Column(name = "fec_actualizacion")
    private LocalDateTime fecActualizacion;

    @PrePersist
    protected void onCreate() {
        fecCreacion = LocalDateTime.now();
        fecActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fecActualizacion = LocalDateTime.now();
    }
}