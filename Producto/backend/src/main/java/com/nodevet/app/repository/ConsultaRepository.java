package com.nodevet.app.repository;

import com.nodevet.app.model.consulta.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {

    // "Solo se puede crear una Consulta por cada Reserva"
    boolean existsByReserva_IdReserva(Integer idReserva);
    
    // Útil para buscar la ficha clínica asociada a una reserva específica
    Optional<Consulta> findByReserva_IdReserva(Integer idReserva);
}