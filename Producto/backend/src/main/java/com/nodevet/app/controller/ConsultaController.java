package com.nodevet.app.controller;

import com.nodevet.app.dto.consulta.ArchivoAdjuntoRequestDTO;
import com.nodevet.app.dto.consulta.ConsultaRequestDTO;
import com.nodevet.app.dto.consulta.ConsultaResponseDTO;
import com.nodevet.app.model.consulta.Consulta;
import com.nodevet.app.service.ConsultaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/consultas")
@RequiredArgsConstructor
@Tag(name = "Ficha Clínica", description = "Endpoints para la gestión de atenciones médicas")
public class ConsultaController {

    private final ConsultaService consultaService;

    @PostMapping
    @Operation(summary = "Crear nueva consulta", description = "Guarda el diagnóstico y notas de una atención médica vinculada a una reserva.")
    public ResponseEntity<Map<String, Object>> crearConsulta(@RequestBody ConsultaRequestDTO request) {
        try {
            // Llamamos al servicio para ejecutar la lógica de negocio
            Consulta nuevaConsulta = consultaService.crearConsulta(request);
            
            // Armamos una respuesta limpia para el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Ficha clínica guardada con éxito");
            response.put("idConsulta", nuevaConsulta.getIdConsulta());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED); // 201 Created
            
        } catch (IllegalStateException | IllegalArgumentException e) {
            // Si el servicio lanza un error (ej: la consulta ya existe), lo capturamos aquí
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    @PostMapping("/{id}/archivos")
    @Operation(summary = "Adjuntar documento", description = "Guarda la URL de un archivo (imagen, PDF) vinculado a una ficha clínica.")
    public ResponseEntity<Map<String, String>> adjuntarArchivo(
            @PathVariable("id") Integer idConsulta, 
            @RequestBody ArchivoAdjuntoRequestDTO request) {
        
        try {
            consultaService.agregarArchivo(idConsulta, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Archivo adjuntado correctamente a la consulta");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/reserva/{idReserva}")
    @Operation(summary = "Obtener ficha clínica", description = "Devuelve los detalles de la consulta y sus archivos adjuntos usando el ID de la reserva.")
    public ResponseEntity<ConsultaResponseDTO> obtenerConsulta(@PathVariable Integer idReserva) {
        try {
            ConsultaResponseDTO response = consultaService.obtenerConsultaPorReserva(idReserva);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 si no existe
        }
    }

    @GetMapping("/mascota/{idMascota}")
    @Operation(summary = "Obtener historial por mascota", description = "Devuelve el listado completo de fichas clínicas asociadas a una mascota.")
    public ResponseEntity<List<ConsultaResponseDTO>> obtenerHistorialMascota(@PathVariable Integer idMascota) {
        List<ConsultaResponseDTO> historial = consultaService.obtenerHistorialPorMascota(idMascota);
        return new ResponseEntity<>(historial, HttpStatus.OK);
    }
}