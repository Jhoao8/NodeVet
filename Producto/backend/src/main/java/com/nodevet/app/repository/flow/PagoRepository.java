package com.nodevet.app.repository.flow;

import com.nodevet.app.model.flow.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    // Busca un pago en la base de datos utilizando el token de transacción que nos entrega Flow.
    Optional<Pago> findByCodTransaccion(String codTransaccion);
}
