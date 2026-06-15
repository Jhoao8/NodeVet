package com.nodevet.app.repository.pago;

import com.nodevet.app.model.pago.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Integer> {
    
    // Spring Boot crea la consulta SQL automáticamente solo con leer el nombre del método
    Optional<Pago> findByReserva_IdReserva(Integer idReserva);
    
}