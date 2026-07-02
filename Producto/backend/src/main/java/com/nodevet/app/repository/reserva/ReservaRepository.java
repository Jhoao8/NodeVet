package com.nodevet.app.repository.reserva;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.nodevet.app.model.reserva.Reserva;

import java.util.List;
import java.util.Optional;
import java.time.LocalTime;
import java.time.LocalDateTime;

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
            "AND NOT EXISTS (SELECT 1 FROM Consulta c WHERE c.reserva = r) " +
            "AND UPPER(r.estadoReserva.nomEstReserva) IN ('PENDIENTE', 'CONFIRMADA') " +
            "ORDER BY b.fecHrInicio ASC")
    List<Reserva> findProximasCitasByTutorCorreo(@Param("correo") String correo);

        @Query("SELECT r FROM Reserva r " +
            "JOIN FETCH r.bloqueHorario b " +
            "JOIN FETCH r.estadoReserva e " +
            "JOIN r.mascota m " +
            "JOIN m.tutor t " +
            "JOIN t.usuario u " +
            "WHERE r.idReserva = :idReserva " +
            "AND u.correoUsr = :correo")
        Optional<Reserva> findByIdAndTutorCorreo(@Param("idReserva") Integer idReserva, @Param("correo") String correo);
    
    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE reserva SET id_est_res = :idEstado WHERE id_reserva = :idReserva", nativeQuery = true)
    void actualizarEstadoNativo(@Param("idReserva") Integer idReserva, @Param("idEstado") Integer idEstado);

            @Query(value = "SELECT COUNT(r.id_reserva) FROM reserva r " +
                "JOIN bloque_horario b ON r.id_bloque = b.id_bloque " +
            "WHERE b.id_vet = :idVet " +
            "AND (WEEKDAY(b.fec_hr_inicio) + 1) = :diaSemana " +
            "AND TIME(b.fec_hr_inicio) >= :horaInicio " +
            "AND TIME(b.fec_hr_fin) <= :horaFin", nativeQuery = true)
        long countReservasByPatronJornada(
            @Param("idVet") Integer idVet,
            @Param("diaSemana") Integer diaSemana,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin
        );

            @Query("SELECT r FROM Reserva r " +
                "JOIN FETCH r.mascota m " +
                "JOIN FETCH m.tutor t " +
                "JOIN FETCH t.usuario tu " +
                "JOIN FETCH r.bloqueHorario b " +
                "JOIN FETCH r.estadoReserva e " +
                "WHERE r.veterinario.usuario.correoUsr = :correoVet " +
                "AND b.fecHrInicio BETWEEN :inicioDia AND :finDia " +
                "AND UPPER(e.nomEstReserva) IN ('PENDIENTE', 'CONFIRMADA') " +
                "ORDER BY b.fecHrInicio ASC")
            List<Reserva> findAgendaDiariaByVeterinarioCorreo(
                @Param("correoVet") String correoVet,
                @Param("inicioDia") LocalDateTime inicioDia,
                @Param("finDia") LocalDateTime finDia
            );
}