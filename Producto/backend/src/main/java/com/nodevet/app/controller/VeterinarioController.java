package com.nodevet.app.controller;

import com.nodevet.app.dto.VeterinarioDTO;
import com.nodevet.app.dto.VeterinarioRegistroDTO;
import com.nodevet.app.model.Veterinario;
import com.nodevet.app.service.VeterinarioService;
import com.nodevet.app.util.DtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/veterinarios")
@RequiredArgsConstructor
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarVeterinario(@Valid @RequestBody VeterinarioRegistroDTO dto) {
        try {
            Veterinario vetGuardado = veterinarioService.registrarVeterinario(dto);
            return new ResponseEntity<>(DtoMapper.toVeterinarioDTO(vetGuardado), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}