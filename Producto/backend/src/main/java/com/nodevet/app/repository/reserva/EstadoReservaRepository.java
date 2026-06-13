package com.nodevet.app.repository.reserva;

import com.nodevet.app.model.reserva.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoReservaRepository extends JpaRepository<EstadoReserva, Integer> {
}