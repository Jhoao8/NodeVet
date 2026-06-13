package com.nodevet.app.repository.flow;

import com.nodevet.app.model.flow.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoPagoRepository extends JpaRepository<EstadoPago, Integer> {
    // Al igual que el otro, se queda vacío. Ya tiene todas las funciones para buscar estados.
}