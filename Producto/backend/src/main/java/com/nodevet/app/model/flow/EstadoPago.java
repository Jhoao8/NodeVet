package com.nodevet.app.model.flow;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ESTADO_PAGO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_est_pago")
    private Integer idEstPago;

    @Column(name = "nom_est_pago", nullable = false, length = 15)
    private String nomEstPago;
}