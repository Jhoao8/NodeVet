package com.nodevet.app.repository.pago;

import com.nodevet.app.model.pago.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoPagoRepository extends JpaRepository<EstadoPago, Integer> {
}