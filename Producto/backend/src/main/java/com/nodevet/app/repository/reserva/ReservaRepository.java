package com.nodevet.app.repository.reserva;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.nodevet.app.model.reserva.Reserva;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    // Citas de un tutor (a través de sus mascotas) y de un veterinario asignado
    List<Reserva> findByMascota_Tutor_IdTutor(Integer idTutor);

    List<Reserva> findByVeterinario_Id(Integer idVet);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE reserva SET id_est_res = :idEstado WHERE id_reserva = :idReserva", nativeQuery = true)
    void actualizarEstadoNativo(@Param("idReserva") Integer idReserva, @Param("idEstado") Integer idEstado);
}