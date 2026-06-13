package com.nodevet.app.controller.agenda;

import com.nodevet.app.dto.agenda.BloqueHorarioDTO;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.service.agenda.AgendaService;
import com.nodevet.app.util.DtoMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agendas")
@RequiredArgsConstructor
public class AgendaController {

    private final AgendaService agendaService;

    @PostMapping("/generar")
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

    /**
     * Endpoint para consultar la disponibilidad de un veterinario.
     * URL de ejemplo: GET http://localhost:8080/api/v1/agendas/disponibles/1
     */
    @GetMapping("/disponibles/{idVet}")
    public ResponseEntity<?> obtenerDisponibles(@PathVariable Integer idVet) {
        try {
            List<BloqueHorarioDTO> disponibles = agendaService.obtenerBloquesDisponibles(idVet);
            
            // Retornamos un 200 OK con la lista de bloques
            return ResponseEntity.ok(disponibles);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener disponibilidad: " + e.getMessage());
        }
    }
}