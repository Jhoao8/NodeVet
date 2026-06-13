package com.nodevet.app.controller;

import com.nodevet.app.dto.reserva.ReservaDTO;
import com.nodevet.app.dto.reserva.ReservaRequestDTO;
import com.nodevet.app.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequestDTO request) {
        try {
            ReservaDTO reservaGuardada = reservaService.crearReserva(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(reservaGuardada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}