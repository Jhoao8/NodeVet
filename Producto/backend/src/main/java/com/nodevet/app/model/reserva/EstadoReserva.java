package com.nodevet.app.model.reserva;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ESTADO_RESERVA")
public class EstadoReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_est_reserva")
    private Integer idEstReserva;

    @Column(name = "nom_est_reserva", length = 50, nullable = false)
    private String nomEstReserva;
}