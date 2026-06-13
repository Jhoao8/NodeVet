package com.nodevet.app.service;

import com.nodevet.app.dto.flow.ReservaRequestDTO;
import com.nodevet.app.model.flow.Reserva;
import com.nodevet.app.repository.flow.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    public Reserva crearReserva(ReservaRequestDTO dto) {
        Reserva nuevaReserva = Reserva.builder()
                .idMascota(dto.getIdMascota())
                .idVet(dto.getIdVet())
                .idBloque(dto.getIdBloque())
                .idValor(dto.getIdValor())
                .idEstRes(1) // 1 = Por defecto nace con estado "Iniciada"
                .fecCreacion(LocalDateTime.now())
                .build();

        return reservaRepository.save(nuevaReserva);
    }
}