package com.nodevet.app.controller;

import com.nodevet.app.dto.EspecialidadDTO;
import com.nodevet.app.model.Especialidad;
import com.nodevet.app.service.EspecialidadService;
import com.nodevet.app.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/especialidades")
@RequiredArgsConstructor
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    // Endpoint para que un admin cree una nueva especialidad
    @PostMapping("/crear")
    public ResponseEntity<EspecialidadDTO> crearEspecialidad(@RequestBody Map<String, String> payload) {
        String nombre = payload.get("nombre");
        if (nombre == null || nombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Especialidad nuevaEspecialidad = especialidadService.crearEspecialidad(nombre);
        return new ResponseEntity<>(DtoMapper.toEspecialidadDTO(nuevaEspecialidad), HttpStatus.CREATED);
    }

    // Endpoint para listar todas las especialidades disponibles
    @GetMapping
    public ResponseEntity<List<EspecialidadDTO>> listarEspecialidades() {
        List<Especialidad> especialidades = especialidadService.obtenerTodas();
        List<EspecialidadDTO> dtos = especialidades.stream()
                .map(DtoMapper::toEspecialidadDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
