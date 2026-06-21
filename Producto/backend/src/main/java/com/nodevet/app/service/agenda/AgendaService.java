package com.nodevet.app.service.agenda;

import com.nodevet.app.dto.agenda.BloqueHorarioDTO;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.model.agenda.EstadoBloque;
import com.nodevet.app.model.agenda.Jornada;
import com.nodevet.app.model.usuario.Veterinario;
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
import java.util.Set;
import java.util.stream.Collectors;

import com.nodevet.app.dto.agenda.VetDispDTO;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgendaService {

    // Gracias a @RequiredArgsConstructor de Lombok, Spring inyecta esto automáticamente
    private final JornadaRepository jornadaRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final VeterinarioRepository veterinarioRepository;

    /**
     * Genera los bloques de horario para un veterinario en un mes y año específicos.
     * @param idVet El ID del veterinario.
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

        // --- CORRECCIÓN: Preparar el estado "DISPONIBLE" (ID = 1) por defecto ---
        EstadoBloque estadoDisponible = new EstadoBloque();
        estadoDisponible.setIdEstBloque(1);

        // 4. Configurar las fechas del mes a procesar
        YearMonth anioMes = YearMonth.of(anio, mes);
        LocalDate fechaInicio = anioMes.atDay(1);
        LocalDate fechaFin = anioMes.atEndOfMonth();

        // --- NUEVO: Traemos los bloques que YA existen en este rango para no duplicarlos ---
        List<BloqueHorario> bloquesExistentes = bloqueHorarioRepository.findByVeterinarioAndRangoFechas(
                idVet,
                fechaInicio.atStartOfDay(),
                fechaFin.atTime(LocalTime.MAX)
        );

        // Set de horarios de inicio ya ocupados, para comparar rápido en memoria (O(1) por búsqueda)
        Set<LocalDateTime> horariosExistentes = bloquesExistentes.stream()
                .map(BloqueHorario::getFecHrInicio)
                .collect(Collectors.toSet());

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

                    // --- NUEVO: Solo creamos el bloque si NO existe ya uno idéntico ---
                    if (!horariosExistentes.contains(fecHrInicioBloque)) {
                        // Construir el bloque usando el Builder de Lombok
                        BloqueHorario bloque = BloqueHorario.builder()
                                .veterinario(veterinario)
                                .fecHrInicio(fecHrInicioBloque)
                                .fecHrFin(fecHrFinBloque)
                                .estadoBloque(estadoDisponible) // <-- CORRECCIÓN: Se asigna el estado aquí
                                .build();

                        nuevosBloques.add(bloque);
                    }

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

    /**
     * Obtiene todos los veterinarios con sus respectivos bloques disponibles para una fecha específica.
     * Filtra para no mostrar bloques que pertenezcan al pasado si se consulta el día de hoy.
     */
    @Transactional(readOnly = true)
    public List<VetDispDTO> obtenerDisponibilidadDiaria(String fecha) {
        // 1. Parsear la fecha recibida (ej: "2026-06-15") y definir el rango del día completo
        LocalDate localDate = LocalDate.parse(fecha);
        LocalDateTime inicioDia = localDate.atStartOfDay();
        LocalDateTime finDia = localDate.atTime(LocalTime.MAX);
        LocalDateTime ahora = LocalDateTime.now();

        // 2. Consultar todos los bloques disponibles en ese rango horario que sean futuros
        List<BloqueHorario> bloquesDisponibles = bloqueHorarioRepository.findDisponiblesPorFecha(inicioDia, finDia, ahora);

        // 3. Agrupar los bloques por Veterinario usando Streams
        Map<Veterinario, List<BloqueHorario>> bloquesPorVeterinario = bloquesDisponibles.stream()
                .collect(Collectors.groupingBy(BloqueHorario::getVeterinario));

        // 4. Transformar el mapa en la lista de DTOs requerida
        List<VetDispDTO> resultado = new ArrayList<>();

        for (Map.Entry<Veterinario, List<BloqueHorario>> entry : bloquesPorVeterinario.entrySet()) {
            Veterinario vet = entry.getKey();
            List<BloqueHorario> bloquesVet = entry.getValue();

            // Construir el nombre completo desde la entidad Usuario relacionada
            String nombreCompleto = "Dr(a). " + vet.getUsuario().getNombreUsr() + " " + vet.getUsuario().getApellidoUsr();

            // Obtener la especialidad principal (Asumiendo que tienes mapeada la relación ManyToMany en tu entidad Veterinario)
            String especialidad = "Veterinario General";

            // Mapear la lista de entidades BloqueHorario a BloqueHorarioDTO
            List<BloqueHorarioDTO> bloquesDTO = bloquesVet.stream()
                    .map(DtoMapper::toBloqueHorarioDTO)
                    .toList();

            // Construir el DTO agrupador
            VetDispDTO dto = new VetDispDTO(
                    vet.getId(),
                    nombreCompleto,
                    especialidad,
                    bloquesDTO
            );

            resultado.add(dto);
        }

        return resultado;
    }
}