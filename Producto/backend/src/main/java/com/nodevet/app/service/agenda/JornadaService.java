package com.nodevet.app.service.agenda;

import com.nodevet.app.dto.agenda.JornadaDTO;
import com.nodevet.app.dto.agenda.JornadaRequestDTO;
import com.nodevet.app.model.agenda.Jornada;
import com.nodevet.app.model.usuario.Veterinario;
import com.nodevet.app.repository.VeterinarioRepository;
import com.nodevet.app.repository.agenda.BloqueHorarioRepository;
import com.nodevet.app.repository.agenda.JornadaRepository;
import com.nodevet.app.repository.reserva.ReservaRepository;
import com.nodevet.app.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JornadaService {

    private final JornadaRepository jornadaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
        private final ReservaRepository reservaRepository;

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

    /**
     * Obtiene todas las reglas de jornada activas (estado 1) para un veterinario específico.
     * * @param idVet ID de la entidad Veterinario.
     * @return Lista de JornadaDTO limpia para consumo del frontend móvil.
     */
    @Transactional(readOnly = true)
    public List<JornadaDTO> obtenerJornadasPorVeterinario(Integer idVet) {
        
        // 1. Consultar moldes de jornada activos usando el método de JornadaRepository
        List<Jornada> jornadas = jornadaRepository.findByVeterinarioIdAndEstJornada(idVet, 1);
        
        // 2. Transformar la colección de entidades a DTOs inmutables con Streams
        return jornadas.stream()
                .map(DtoMapper::toJornadaDTO)
                .toList();
    }

    @Transactional
    public JornadaDTO actualizarJornada(Integer idJornada, JornadaRequestDTO request) {

        // 1. Verificar que la jornada existe
        Jornada jornada = jornadaRepository.findById(idJornada)
                .orElseThrow(() -> new RuntimeException("Jornada no encontrada con ID: " + idJornada));

        // 2. Actualizar los campos modificables
        jornada.setHoraInicio(request.getHoraInicio());
        jornada.setHoraFin(request.getHoraFin());

        // 3. Guardar y retornar el DTO actualizado
        Jornada jornadaActualizada = jornadaRepository.save(jornada);
        return DtoMapper.toJornadaDTO(jornadaActualizada);
    }

    @Transactional
    public String eliminarJornadaConBloques(Integer idJornada) {
        Jornada jornada = jornadaRepository.findById(idJornada)
                .orElseThrow(() -> new RuntimeException("Jornada no encontrada con ID: " + idJornada));

        Integer idVet = jornada.getVeterinario().getId();

        long reservasAsociadas = reservaRepository.countReservasByPatronJornada(
                idVet,
                jornada.getDiaSemana(),
                jornada.getHoraInicio(),
                jornada.getHoraFin()
        );

        if (reservasAsociadas > 0) {
            throw new RuntimeException("No se puede eliminar esta jornada porque tiene reservas asociadas. Revisa o cancela esas reservas primero.");
        }

        int bloquesEliminados = bloqueHorarioRepository.deleteByVetAndPatronJornada(
                idVet,
                jornada.getDiaSemana(),
                jornada.getHoraInicio(),
                jornada.getHoraFin()
        );

        jornadaRepository.delete(jornada);

        return "Jornada eliminada correctamente. Bloques eliminados: " + bloquesEliminados;
    }
}