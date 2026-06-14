package com.nodevet.app.controller;

import com.nodevet.app.dto.BloqueHorarioRequestDTO;
import com.nodevet.app.model.BloqueHorario;
import com.nodevet.app.service.BloqueHorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bloques-horarios")
@RequiredArgsConstructor
public class BloqueHorarioController {

    private final BloqueHorarioService bloqueHorarioService;

    @PostMapping
    public ResponseEntity<?> crearBloque(@RequestBody BloqueHorarioRequestDTO dto) {
        try {
            BloqueHorario nuevoBloque = bloqueHorarioService.registrarBloque(dto);
            return new ResponseEntity<>(nuevoBloque, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
