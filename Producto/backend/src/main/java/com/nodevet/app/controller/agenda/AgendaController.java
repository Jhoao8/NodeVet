package com.nodevet.app.controller.agenda;

import com.nodevet.app.dto.agenda.BloqueHorarioDTO;
import com.nodevet.app.dto.agenda.VetDispDTO;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.service.agenda.AgendaService;
import com.nodevet.app.util.DtoMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agendas")
@RequiredArgsConstructor
@Tag(name = "Agenda", description = "Gestión de la disponibilidad médica. Permite generar bloques horarios mensuales y consultar la disponibilidad de los veterinarios.")
public class AgendaController {

    private final AgendaService agendaService;

    @PostMapping
    @Operation(summary = "Generar bloques horarios", description = "Crea automáticamente los bloques de atención para un veterinario en un mes y año específicos, basándose en su jornada laboral base. Permite ajustar la duración de cada bloque (por defecto 30 min).")
    public ResponseEntity<?> generarBloques(
            @RequestParam Integer idVet,
            @RequestParam int anio,
            @RequestParam int mes,
            @RequestParam(required = false) Integer duracionMinutos) {
        
        try {
            // 1. Llamamos a la lógica pesada
            List<BloqueHorario> bloquesGenerados = agendaService.generarBloquesMensuales(idVet, anio, mes, duracionMinutos);
            
            // 2. Transformamos las Entidades a DTOs
            List<BloqueHorarioDTO> bloquesDTO = bloquesGenerados.stream()
                    .map(DtoMapper::toBloqueHorarioDTO)
                    .toList();
            
            // 3. Devolvemos el DTO limpio
            return ResponseEntity.status(HttpStatus.CREATED).body(bloquesDTO);
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/veterinarios/{idVet}/disponibilidad")
    @Operation(summary = "Obtener disponibilidad por veterinario", description = "Retorna una lista con todos los bloques horarios que actualmente están libres (sin reservas) para el veterinario indicado.")
    public ResponseEntity<?> obtenerDisponibles(@PathVariable Integer idVet) {
        try {
            List<BloqueHorarioDTO> disponibles = agendaService.obtenerBloquesDisponibles(idVet);
            return ResponseEntity.ok(disponibles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener disponibilidad: " + e.getMessage());
        }
    }

    @GetMapping("/disponibilidad")
    @Operation(summary = "Obtener disponibilidad diaria general", description = "Filtra y devuelve los bloques horarios disponibles de todos los veterinarios de la clínica para una fecha específica (formato YYYY-MM-DD).")
    public ResponseEntity<?> obtenerDisponiblesPorFecha(@RequestParam String fecha) {
        try {
            List<VetDispDTO> disponibles = agendaService.obtenerDisponibilidadDiaria(fecha);
            return ResponseEntity.ok(disponibles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener disponibilidad diaria: " + e.getMessage());
        }
    }
}