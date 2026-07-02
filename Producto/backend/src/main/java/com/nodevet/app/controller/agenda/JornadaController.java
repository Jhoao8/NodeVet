package com.nodevet.app.controller.agenda;

import com.nodevet.app.dto.agenda.JornadaDTO;
import com.nodevet.app.dto.agenda.JornadaRequestDTO;
import com.nodevet.app.service.agenda.JornadaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jornadas")
@RequiredArgsConstructor
@Tag(name = "Jornadas Laborales", description = "Configuración de los horarios base. Permite al administrador definir los días de la semana y los rangos de horas que trabaja cada veterinario.")
public class JornadaController {

    private final JornadaService jornadaService;

    @PostMapping
    @Operation(summary = "Crear regla de jornada laboral", description = "Registra un nuevo patrón de horario para un veterinario (ej: Lunes de 09:00 a 14:00). Esta regla servirá como molde posteriormente para generar la agenda mensual.")
    public ResponseEntity<?> crearJornada(@RequestBody JornadaRequestDTO request) {
        try {
            JornadaDTO nuevaJornada = jornadaService.crearJornada(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaJornada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/veterinario/{idVet}")
    @Operation(summary = "Obtener jornadas por veterinario", description = "Lista todos los moldes o reglas de horario activo configurados para un veterinario específico.")
    public ResponseEntity<?> obtenerJornadasPorVet(@PathVariable Integer idVet) {
        try {
            List<JornadaDTO> jornadasDTO = jornadaService.obtenerJornadasPorVeterinario(idVet);
            return ResponseEntity.ok(jornadasDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{idJornada}")
    @Operation(summary = "Actualizar jornada laboral", description = "Modifica la hora de inicio y fin de una jornada laboral existente.")
    public ResponseEntity<?> actualizarJornada(@PathVariable Integer idJornada, @RequestBody JornadaRequestDTO request) {
        try {
            JornadaDTO jornadaActualizada = jornadaService.actualizarJornada(idJornada, request);
            return ResponseEntity.ok(jornadaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{idJornada}")
    @Operation(summary = "Eliminar jornada laboral", description = "Elimina de forma permanente una jornada y todos los bloques horarios asociados a su patrón (veterinario, día y rango horario).")
    public ResponseEntity<?> eliminarJornada(@PathVariable Integer idJornada) {
        try {
            String resultado = jornadaService.eliminarJornadaConBloques(idJornada);
            return ResponseEntity.ok(Map.of("mensaje", resultado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno al eliminar jornada.");
        }
    }
}