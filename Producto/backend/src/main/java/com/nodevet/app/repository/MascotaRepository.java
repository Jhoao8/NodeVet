package com.nodevet.app.repository;

import com.nodevet.app.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Integer> {
    // Esto te servirá luego para listar solo las mascotas del tutor logueado
    List<Mascota> findByTutor_IdTutorAndEstadoMasc(Integer idTutor, Integer estadoMasc);
}