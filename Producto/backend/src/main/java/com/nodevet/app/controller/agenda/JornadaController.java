package com.nodevet.app.controller.agenda;

import com.nodevet.app.dto.agenda.JornadaDTO;
import com.nodevet.app.dto.agenda.JornadaRequestDTO;
import com.nodevet.app.service.agenda.JornadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jornadas")
@RequiredArgsConstructor
public class JornadaController {

    private final JornadaService jornadaService;

    @PostMapping
    public ResponseEntity<?> crearJornada(@RequestBody JornadaRequestDTO request) {
        try {
            JornadaDTO nuevaJornada = jornadaService.crearJornada(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaJornada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}