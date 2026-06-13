package com.nodevet.app.service;

import com.nodevet.app.dto.reserva.ReservaRequestDTO;
import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.Valor;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.model.agenda.EstadoBloque; // <-- NUEVA IMPORTACIÓN
import com.nodevet.app.model.reserva.EstadoReserva;
import com.nodevet.app.model.reserva.Reserva;
import com.nodevet.app.model.usuario.Veterinario;
import com.nodevet.app.repository.MascotaRepository;
import com.nodevet.app.repository.ValorRepository;
import com.nodevet.app.repository.VeterinarioRepository;
import com.nodevet.app.repository.agenda.BloqueHorarioRepository;
import com.nodevet.app.repository.reserva.EstadoReservaRepository;
import com.nodevet.app.repository.reserva.ReservaRepository;
import com.nodevet.app.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final ValorRepository valorRepository;
    private final EstadoReservaRepository estadoReservaRepository;

    @Transactional
    public com.nodevet.app.dto.reserva.ReservaDTO crearReserva(ReservaRequestDTO request) {

        // 1. Validar que todo lo que nos envían existe
        Mascota mascota = mascotaRepository.findById(request.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Veterinario veterinario = veterinarioRepository.findById(request.getIdVet())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        BloqueHorario bloque = bloqueHorarioRepository.findById(request.getIdBloque())
                .orElseThrow(() -> new RuntimeException("Bloque horario no encontrado"));

        
        // A. Validar que el bloque realmente siga "Disponible" (ID = 1)
        if (bloque.getEstadoBloque() == null || bloque.getEstadoBloque().getIdEstBloque() != 1) {
            throw new RuntimeException("¡Lo sentimos! Este bloque horario ya fue ocupado por otro paciente.");
        }

        // B. Crear la referencia al estado "Ocupado" (ID = 2)
        EstadoBloque estadoOcupado = new EstadoBloque();
        estadoOcupado.setIdEstBloque(2);

        // C. Cambiar el estado del bloque y guardarlo
        bloque.setEstadoBloque(estadoOcupado);
        bloqueHorarioRepository.save(bloque);
        

        Valor valor = valorRepository.findById(request.getIdValor())
                .orElseThrow(() -> new RuntimeException("Valor no encontrado"));

        // 2. Asignar el estado inicial (ID 1 = Pendiente)
        EstadoReserva estado = estadoReservaRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado de reserva por defecto no configurado"));

        // 3. Armar la reserva
        Reserva nuevaReserva = Reserva.builder()
                .mascota(mascota)
                .veterinario(veterinario)
                .bloqueHorario(bloque)
                .valor(valor)
                .estadoReserva(estado)
                .build();

        // 4. Guardar y retornar
        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);
        return DtoMapper.toReservaDTO(reservaGuardada);
    }
}