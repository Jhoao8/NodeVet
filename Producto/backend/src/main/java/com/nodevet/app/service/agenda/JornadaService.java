package com.nodevet.app.service.agenda;

import com.nodevet.app.dto.agenda.JornadaDTO;
import com.nodevet.app.dto.agenda.JornadaRequestDTO;
import com.nodevet.app.model.agenda.Jornada;
import com.nodevet.app.model.usuario.Veterinario;
import com.nodevet.app.repository.VeterinarioRepository;
import com.nodevet.app.repository.agenda.JornadaRepository;
import com.nodevet.app.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JornadaService {

    private final JornadaRepository jornadaRepository;
    private final VeterinarioRepository veterinarioRepository;

    @Transactional
    public JornadaDTO crearJornada(JornadaRequestDTO request) {
        
        // 1. Validar que el veterinario exista
        Veterinario veterinario = veterinarioRepository.findById(request.getIdVet())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado con ID: " + request.getIdVet()));

        // 2. Construir la nueva entidad usando Lombok Builder
        Jornada nuevaJornada = Jornada.builder()
                .veterinario(veterinario)
                .diaSemana(request.getDiaSemana())
                .horaInicio(request.getHoraInicio())
                .horaFin(request.getHoraFin())
                // estJornada toma el valor por defecto 1 gracias a la entidad
                .build();

        // 3. Guardar en MySQL
        Jornada jornadaGuardada = jornadaRepository.save(nuevaJornada);

        // 4. Retornar el DTO limpio
        return DtoMapper.toJornadaDTO(jornadaGuardada);
    }
}