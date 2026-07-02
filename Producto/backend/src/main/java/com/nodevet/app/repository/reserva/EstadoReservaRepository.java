package com.nodevet.app.repository.reserva;

import com.nodevet.app.model.reserva.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoReservaRepository extends JpaRepository<EstadoReserva, Integer> {
	Optional<EstadoReserva> findByNomEstReservaIgnoreCase(String nomEstReserva);
}