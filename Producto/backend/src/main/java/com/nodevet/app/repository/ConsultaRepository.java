package com.nodevet.app.repository;

import com.nodevet.app.model.consulta.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {

    boolean existsByReserva_IdReserva(Integer idReserva);
    
    Optional<Consulta> findByReserva_IdReserva(Integer idReserva);

    // ════ NUEVO MÉTODO DE BÚSQUEDA EXÁCTO ════
    List<Consulta> findByReserva_Mascota_IdMascota(Integer idMascota);
}