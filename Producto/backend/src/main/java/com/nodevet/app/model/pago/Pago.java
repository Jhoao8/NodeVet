package com.nodevet.app.model.pago;

import com.nodevet.app.model.reserva.Reserva;
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
@Table(name = "PAGO")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Integer idPago;

    // Relación con la reserva asociada
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    // El monto congelado al momento de crear la reserva
    @Column(name = "monto", nullable = false)
    private Integer monto;

    // Estado actual de la transacción
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_est_pago", nullable = false)
    private EstadoPago estadoPago;

    // Código que nos devolverá Flow para hacer la trazabilidad
    @Column(name = "cod_transaccion", length = 100, nullable = false)
    private String codTransaccion;

    @Column(name = "fecha_pago", nullable = false, updatable = false)
    private LocalDateTime fechaPago;

    @PrePersist
    protected void onCreate() {
        fechaPago = LocalDateTime.now();
    }
}