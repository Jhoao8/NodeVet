package com.nodevet.app.repository.agenda;

import com.nodevet.app.model.agenda.BloqueHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Integer> {

    @Query(value = "SELECT b.* FROM BLOQUE_HORARIO b " +
                   "LEFT JOIN RESERVA r ON b.id_bloque = r.id_bloque " +
                   "WHERE b.id_vet = :idVet " +
                   "AND b.fec_hr_inicio >= :fechaActual " +
                   "AND r.id_bloque IS NULL " +
                   "ORDER BY b.fec_hr_inicio ASC", 
           nativeQuery = true)
    List<BloqueHorario> findBloquesDisponibles(@Param("idVet") Integer idVet, @Param("fechaActual") LocalDateTime fechaActual);
}