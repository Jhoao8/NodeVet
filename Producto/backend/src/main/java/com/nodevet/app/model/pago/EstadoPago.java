package com.nodevet.app.model.pago;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ESTADO_PAGO")
public class EstadoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_est_pago")
    private Integer idEstPago;

    @Column(name = "nom_est_pago", length = 15, nullable = false)
    private String nomEstPago;
}