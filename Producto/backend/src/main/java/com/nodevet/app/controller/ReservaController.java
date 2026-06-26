package com.nodevet.app.controller;

import com.nodevet.app.dto.reserva.ReservaDTO;
import com.nodevet.app.dto.reserva.ReservaRequestDTO;
import com.nodevet.app.dto.reserva.ReservaResponseDTO;
import com.nodevet.app.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservas")
@RequiredArgsConstructor
@Tag(name = "Reservas", description = "Gestión de citas médicas. Permite agendar atenciones vinculando a la mascota, el tutor y la disponibilidad del veterinario.")
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    @Operation(summary = "Crear nueva reserva", description = "Genera una nueva cita médica para una mascota específica. Se requiere indicar el bloque horario disponible y el motivo de la consulta.")
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequestDTO request) {
        try {
            ReservaDTO reservaGuardada = reservaService.crearReserva(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(reservaGuardada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Listar mis reservas", description = "Devuelve las reservas del usuario autenticado: si es Tutor, las citas de sus mascotas; si es Veterinario, las citas que tiene asignadas.")
    public ResponseEntity<List<ReservaResponseDTO>> listarMisReservas() {
        return ResponseEntity.ok(reservaService.listarMisReservas());
    }
}
