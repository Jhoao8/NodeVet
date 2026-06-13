package com.nodevet.app.model.flow;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "RESERVA")
@Data // Lombok es la que crea automáticamente el getIdReserva()
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long idReserva;

    // ════ LLAVES FORÁNEAS (Mapeadas como Integer para que compile sin depender de otras clases) ════
    @Column(name = "id_mascota", nullable = false)
    private Integer idMascota;

    @Column(name = "id_vet", nullable = false)
    private Integer idVet;

    @Column(name = "id_bloque", nullable = false)
    private Integer idBloque;

    @Column(name = "id_valor", nullable = false)
    private Integer idValor;

    @Column(name = "id_est_res", nullable = false)
    private Integer idEstRes;

    // ════ CAMPOS PROPIOS DE LA RESERVA ════
    @Column(name = "mot_res", nullable = false)
    private String mot_res;

    @Column(name = "fec_creacion", nullable = false)
    private LocalDateTime fecCreacion;

    @Column(name = "fec_actualizacion")
    private LocalDateTime fecActualizacion;
}