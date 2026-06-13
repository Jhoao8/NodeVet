package com.nodevet.app.model.flow;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAGO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    // Relación con tu entidad Reserva existente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @Column(name = "monto", nullable = false)
    private Integer monto;

    // Relación con el estado de pago creado en el paso anterior
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_est_pago", nullable = false)
    private EstadoPago estadoPago;

    // Aquí guardaremos el token_ws entregado por Transbank para hacer el seguimiento
    @Column(name = "cod_transaccion", nullable = false, length = 100)
    private String codTransaccion;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;
}