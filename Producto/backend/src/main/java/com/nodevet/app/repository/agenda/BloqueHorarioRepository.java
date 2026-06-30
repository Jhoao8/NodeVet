package com.nodevet.app.repository.agenda;

import com.nodevet.app.model.agenda.BloqueHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Integer> {

    @Query("SELECT b FROM BloqueHorario b " +
        "JOIN FETCH b.veterinario v " +
        "JOIN FETCH v.usuario u " +
        "WHERE b.fecHrInicio BETWEEN :inicio AND :fin " +
        "AND b.estadoBloque.idEstBloque = 1 " + // 1 = DISPONIBLE según tu script SQL
        "AND b.fecHrInicio > :ahora " +
        "ORDER BY b.fecHrInicio ASC")
    List<BloqueHorario> findDisponiblesPorFecha(
            @Param("inicio") LocalDateTime inicio, 
            @Param("fin") LocalDateTime fin, 
            @Param("ahora") LocalDateTime ahora
    );

    @Query(value = "SELECT b.* FROM BLOQUE_HORARIO b " +
                "LEFT JOIN RESERVA r ON b.id_bloque = r.id_bloque " +
                "WHERE b.id_vet = :idVet " +
                "AND b.fec_hr_inicio >= :fechaActual " +
                "AND r.id_bloque IS NULL " +
                "ORDER BY b.fec_hr_inicio ASC", 
        nativeQuery = true)
    List<BloqueHorario> findBloquesDisponibles(@Param("idVet") Integer idVet, @Param("fechaActual") LocalDateTime fechaActual);

    @Query("SELECT b FROM BloqueHorario b " +
        "WHERE b.veterinario.id = :idVet " +
        "AND b.fecHrInicio BETWEEN :inicio AND :fin")
    List<BloqueHorario> findByVeterinarioAndRangoFechas(
            @Param("idVet") Integer idVet,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    void deleteByVeterinarioId(Integer idVet);
}