package com.nodevet.app.controller;

import com.nodevet.app.dto.reserva.ReservaDTO;
import com.nodevet.app.dto.reserva.ProximaCitaHomeDTO;
import com.nodevet.app.dto.reserva.ReservaVetDiaDTO;
import com.nodevet.app.dto.reserva.ReservaRequestDTO;
import com.nodevet.app.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @PreAuthorize("hasRole('TUTOR')")
    @GetMapping("/proximas")
    @Operation(summary = "Obtener próximas citas del tutor", description = "Devuelve hasta dos próximas citas del tutor autenticado para el Home.")
    public ResponseEntity<List<ProximaCitaHomeDTO>> obtenerProximasCitasTutor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reservaService.obtenerProximasCitasTutor(authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('VET','ADMIN')")
    @GetMapping("/veterinario/agenda")
    @Operation(summary = "Obtener agenda diaria del veterinario", description = "Retorna las reservas del veterinario autenticado para la fecha solicitada (YYYY-MM-DD).")
    public ResponseEntity<List<ReservaVetDiaDTO>> obtenerAgendaDiariaVeterinario(@RequestParam String fecha) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reservaService.obtenerAgendaDiariaVeterinario(authentication.getName(), fecha));
    }

    @PreAuthorize("hasRole('TUTOR')")
    @DeleteMapping("/{idReserva}/cancelar")
    @Operation(summary = "Cancelar reserva del tutor", description = "Permite cancelar una reserva propia solo si no tiene pago obligatorio y faltan al menos 24 horas para la cita. También libera el bloque horario.")
    public ResponseEntity<?> cancelarReservaTutor(@PathVariable Integer idReserva) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            reservaService.cancelarReservaTutor(idReserva, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }
}