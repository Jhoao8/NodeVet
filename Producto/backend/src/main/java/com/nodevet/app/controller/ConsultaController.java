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
@Tag(name = "Ficha Clínica", description = "Gestión del historial médico de los pacientes. Permite registrar diagnósticos, recetas y adjuntar resultados de exámenes.")
public class ConsultaController {

    private final ConsultaService consultaService;

    @PostMapping
    @Operation(summary = "Registrar nueva consulta", description = "Crea el registro clínico de una atención médica, validando previamente que la reserva asociada exista y esté confirmada.")
    public ResponseEntity<Map<String, Object>> crearConsulta(@RequestBody ConsultaRequestDTO request) {
        try {
            Consulta nuevaConsulta = consultaService.crearConsulta(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Ficha clínica guardada con éxito");
            response.put("idConsulta", nuevaConsulta.getIdConsulta());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED); 
            
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST); 
        }
    }

    @PostMapping("/{id}/archivos")
    @Operation(summary = "Adjuntar archivo médico", description = "Vincula un documento externo (ej. radiografía, examen de sangre en PDF) a una ficha clínica existente mediante su URL de almacenamiento (Cloudinary o S3).")
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
    @Operation(summary = "Obtener consulta por reserva", description = "Recupera la ficha clínica completa, incluyendo la lista de URLs de sus archivos adjuntos, a partir del ID de la reserva original.")
    public ResponseEntity<ConsultaResponseDTO> obtenerConsulta(@PathVariable Integer idReserva) {
        try {
            ConsultaResponseDTO response = consultaService.obtenerConsultaPorReserva(idReserva);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }

    @GetMapping("/mascota/{idMascota}")
    @Operation(summary = "Obtener historial por mascota", description = "Devuelve el listado completo de fichas clínicas asociadas a una mascota.")
    public ResponseEntity<List<ConsultaResponseDTO>> obtenerHistorialMascota(@PathVariable Integer idMascota) {
        List<ConsultaResponseDTO> historial = consultaService.obtenerHistorialPorMascota(idMascota);
        return new ResponseEntity<>(historial, HttpStatus.OK);
    }
}