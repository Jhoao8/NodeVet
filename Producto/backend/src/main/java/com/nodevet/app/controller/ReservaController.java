package com.nodevet.app.controller;

import com.nodevet.app.dto.flow.ReservaRequestDTO;
import com.nodevet.app.model.flow.Reserva;
import com.nodevet.app.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping("/crear")
    public ResponseEntity<Reserva> crearReserva(@RequestBody ReservaRequestDTO request) {
        Reserva reservaCreada = reservaService.crearReserva(request);
        // Devolvemos la reserva completa (incluyendo el ID que acaba de generar la base de datos)
        return ResponseEntity.ok(reservaCreada);
    }
}