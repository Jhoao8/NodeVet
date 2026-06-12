package com.nodevet.app.service.agenda;

import com.nodevet.app.dto.agenda.BloqueHorarioDTO;
import com.nodevet.app.model.Veterinario;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.model.agenda.Jornada;
import com.nodevet.app.repository.VeterinarioRepository;
import com.nodevet.app.repository.agenda.BloqueHorarioRepository;
import com.nodevet.app.repository.agenda.JornadaRepository;
import com.nodevet.app.util.DtoMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendaService {

    // Gracias a @RequiredArgsConstructor de Lombok, Spring inyecta esto automáticamente
    private final JornadaRepository jornadaRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final VeterinarioRepository veterinarioRepository;

    /**
     * Genera los bloques de horario para un veterinario en un mes y año específicos.
     * * @param idVet El ID del veterinario.
     * @param anio El año (ej. 2026).
     * @param mes El mes (1 a 12).
     * @param duracionMinutos La duración del bloque. Si viene null, por defecto será 30.
     */
    @Transactional
    public List<BloqueHorario> generarBloquesMensuales(Integer idVet, int anio, int mes, Integer duracionMinutos) {
        
        // 1. Manejar la duración dinámica (Para tu futura vista de Admin)
        int duracion = (duracionMinutos != null && duracionMinutos > 0) ? duracionMinutos : 30;

        // 2. Validar que el veterinario exista
        Veterinario veterinario = veterinarioRepository.findById(idVet)
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado con ID: " + idVet));

        // 3. Obtener las jornadas activas de este veterinario
        List<Jornada> jornadas = jornadaRepository.findByVeterinarioIdAndEstJornada(idVet, 1);        
        if (jornadas.isEmpty()) {
            throw new RuntimeException("El veterinario no tiene jornadas laborales configuradas.");
        }

        // 4. Configurar las fechas del mes a procesar
        YearMonth anioMes = YearMonth.of(anio, mes);
        LocalDate fechaInicio = anioMes.atDay(1);
        LocalDate fechaFin = anioMes.atEndOfMonth();

        List<BloqueHorario> nuevosBloques = new ArrayList<>();

        // 5. Recorrer cada día del mes (Ej: del 1 al 31)
        for (LocalDate fecha = fechaInicio; !fecha.isAfter(fechaFin); fecha = fecha.plusDays(1)) {
            
            // Obtener qué día de la semana es hoy (1=Lunes, 7=Domingo)
            int diaSemanaActual = fecha.getDayOfWeek().getValue();

            // Buscar si el veterinario trabaja este día específico
            Jornada jornadaDelDia = jornadas.stream()
                    .filter(j -> j.getDiaSemana() == diaSemanaActual)
                    .findFirst()
                    .orElse(null);

            // Si trabaja este día, procedemos a "cortar" el tiempo en bloques
            if (jornadaDelDia != null) {
                LocalTime horaActual = jornadaDelDia.getHoraInicio();
                LocalTime horaFinal = jornadaDelDia.getHoraFin();

                // Mientras la hora actual + los minutos del bloque no se pasen de su hora de salida
                while (!horaActual.plusMinutes(duracion).isAfter(horaFinal)) {
                    
                    // Combinar la fecha (día) con la hora para crear el LocalDateTime
                    LocalDateTime fecHrInicioBloque = LocalDateTime.of(fecha, horaActual);
                    LocalDateTime fecHrFinBloque = LocalDateTime.of(fecha, horaActual.plusMinutes(duracion));

                    // Construir el bloque usando el Builder de Lombok
                    BloqueHorario bloque = BloqueHorario.builder()
                            .veterinario(veterinario)
                            .fecHrInicio(fecHrInicioBloque)
                            .fecHrFin(fecHrFinBloque)
                            .build();

                    nuevosBloques.add(bloque);

                    // Avanzar el reloj para el siguiente ciclo del bucle
                    horaActual = horaActual.plusMinutes(duracion);
                }
            }
        }

        // 6. Guardar todos los bloques generados en la base de datos de una sola vez por rendimiento
        return bloqueHorarioRepository.saveAll(nuevosBloques);
    }

    /**
     * Obtiene los bloques futuros disponibles (sin reserva) para un veterinario.
     */
    @Transactional(readOnly = true)
    public List<BloqueHorarioDTO> obtenerBloquesDisponibles(Integer idVet) {
        
        // 1. Tomamos la fecha y hora actual para no mostrar bloques del pasado
        LocalDateTime ahora = LocalDateTime.now();

        // 2. Buscamos en la base de datos
        List<BloqueHorario> bloquesLibres = bloqueHorarioRepository.findBloquesDisponibles(idVet, ahora);

        // 3. Transformamos a DTO para enviarlo limpio al frontend
        return bloquesLibres.stream()
                .map(DtoMapper::toBloqueHorarioDTO)
                .toList();
    }
}