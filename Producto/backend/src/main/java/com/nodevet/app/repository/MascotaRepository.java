package com.nodevet.app.repository;

import com.nodevet.app.model.Mascota;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Integer> {
    // Esto te servirá luego para listar solo las mascotas del tutor logueado
    List<Mascota> findByTutor_IdTutorAndEstadoMasc(Integer idTutor, Integer estadoMasc);

    // Consulta para cambiar el estado a 0 (Soft Delete)
    @Modifying
    @Transactional
    @Query("UPDATE Mascota m SET m.estadoMasc = 0 WHERE m.idMascota = :id")
    void softDelete(Integer id);
}