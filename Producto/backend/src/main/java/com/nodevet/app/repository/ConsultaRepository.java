package com.nodevet.app.repository;

import com.nodevet.app.model.consulta.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {

    boolean existsByReserva_IdReserva(Integer idReserva);
    
    Optional<Consulta> findByReserva_IdReserva(Integer idReserva);

        @Query("SELECT c FROM Consulta c " +
            "JOIN FETCH c.reserva r " +
            "JOIN FETCH r.bloqueHorario b " +
            "JOIN FETCH r.veterinario v " +
            "JOIN FETCH v.usuario vu " +
            "JOIN FETCH r.estadoReserva er " +
            "WHERE r.mascota.idMascota = :idMascota " +
            "AND c.isDeleted = false " +
            "AND UPPER(er.nomEstReserva) = 'COMPLETADA' " +
            "ORDER BY b.fecHrInicio DESC")
        List<Consulta> findHistorialExitosoByMascotaId(@Param("idMascota") Integer idMascota);

    @Query("SELECT c FROM Consulta c " +
            "JOIN FETCH c.reserva r " +
            "JOIN FETCH r.bloqueHorario b " +
            "JOIN FETCH r.veterinario v " +
            "JOIN FETCH v.usuario vu " +
            "JOIN FETCH r.estadoReserva er " +
            "WHERE vu.correoUsr = :correoVet " +
            "AND c.isDeleted = false " +
            "AND UPPER(er.nomEstReserva) = 'COMPLETADA' " +
            "ORDER BY b.fecHrInicio DESC")
    List<Consulta> findHistorialExitosoByVeterinarioCorreo(@Param("correoVet") String correoVet);
}