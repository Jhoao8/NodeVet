package com.nodevet.app.controller;

import com.nodevet.app.dto.EspecialidadDTO;
import com.nodevet.app.model.Especialidad;
import com.nodevet.app.service.EspecialidadService;
import com.nodevet.app.util.DtoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Especialidades Médicas", description = "Catálogo de las áreas de especialización veterinaria (ej. Dermatología, Cirugía).")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    @PostMapping
    @Operation(summary = "Crear nueva especialidad", description = "Añade una nueva especialidad médica al catálogo de la clínica. Acción exclusiva para Administradores.")
    public ResponseEntity<EspecialidadDTO> crearEspecialidad(@RequestBody Map<String, String> payload) {
        String nombre = payload.get("nombre");
        if (nombre == null || nombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Especialidad nuevaEspecialidad = especialidadService.crearEspecialidad(nombre);
        return new ResponseEntity<>(DtoMapper.toEspecialidadDTO(nuevaEspecialidad), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Listar especialidades", description = "Obtiene la lista completa de especialidades registradas en el sistema. Utilizado para los menús desplegables de registro de veterinarios.")
    public ResponseEntity<List<EspecialidadDTO>> listarEspecialidades() {
        List<Especialidad> especialidades = especialidadService.obtenerTodas();
        List<EspecialidadDTO> dtos = especialidades.stream()
                .map(DtoMapper::toEspecialidadDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}