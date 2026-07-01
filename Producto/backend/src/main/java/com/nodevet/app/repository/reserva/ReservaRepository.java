package com.nodevet.app.repository.reserva;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.nodevet.app.model.reserva.Reserva;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    long countByMascota_Tutor_Usuario_IdUsuario(Integer idUsuario);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.mascota.tutor.usuario.idUsuario = :idUsuario AND UPPER(r.estadoReserva.nomEstReserva) IN ('COMPLETADA', 'ASISTIDA')")
    long countAsistidasByTutorUsuarioId(@Param("idUsuario") Integer idUsuario);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.mascota.tutor.usuario.idUsuario = :idUsuario AND UPPER(r.estadoReserva.nomEstReserva) = 'AUSENTE'")
    long countAusentadasByTutorUsuarioId(@Param("idUsuario") Integer idUsuario);

    @Query("SELECT r FROM Reserva r " +
            "JOIN FETCH r.mascota m " +
            "JOIN FETCH r.bloqueHorario b " +
            "WHERE m.tutor.usuario.correoUsr = :correo " +
            "AND b.fecHrInicio >= CURRENT_TIMESTAMP " +
            "AND UPPER(r.estadoReserva.nomEstReserva) IN ('PENDIENTE', 'CONFIRMADA') " +
            "ORDER BY b.fecHrInicio ASC")
    List<Reserva> findProximasCitasByTutorCorreo(@Param("correo") String correo);
    
    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE reserva SET id_est_res = :idEstado WHERE id_reserva = :idReserva", nativeQuery = true)
    void actualizarEstadoNativo(@Param("idReserva") Integer idReserva, @Param("idEstado") Integer idEstado);
}