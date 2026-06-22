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
}