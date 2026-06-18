package com.nodevet.app.controller;

import com.nodevet.app.dto.usuario.VeterinarioRegistroDTO;
import com.nodevet.app.model.usuario.Veterinario;
import com.nodevet.app.service.usuario.VeterinarioService;
import com.nodevet.app.util.DtoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/veterinarios")
@RequiredArgsConstructor
@Tag(name = "Veterinarios", description = "Gestión del personal médico. Permite registrar y administrar a los profesionales veterinarios de la clínica.")
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    @PostMapping
    @Operation(summary = "Registrar nuevo veterinario", description = "Crea una cuenta para un profesional de la salud, incluyendo su RUT y vinculando sus especialidades médicas. Esta acción es de uso exclusivo para Administradores.")
    public ResponseEntity<?> registrarVeterinario(@Valid @RequestBody VeterinarioRegistroDTO dto) {
        try {
            Veterinario vetGuardado = veterinarioService.registrarVeterinario(dto);
            return new ResponseEntity<>(DtoMapper.toVeterinarioDTO(vetGuardado), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}