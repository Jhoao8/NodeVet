package com.nodevet.app.controller;

import com.nodevet.app.dto.MascotaRequestDTO;
import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.usuario.Tutor;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.repository.MascotaRepository;
import com.nodevet.app.repository.TutorRepository;
import com.nodevet.app.repository.UsuarioRepository;
import com.nodevet.app.service.MascotaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mascotas")
@RequiredArgsConstructor
@Tag(name = "Mascotas", description = "Gestión de los pacientes veterinarios. Permite el registro, listado y modificación de mascotas.")
public class MascotaController {

    private final MascotaService mascotaService;
    private final UsuarioRepository usuarioRepository;
    private final TutorRepository tutorRepository;
    private final MascotaRepository mascotaRepository;

    @PostMapping
    @Operation(summary = "Registrar nueva mascota", description = "Crea el perfil de una mascota y lo vincula automáticamente al tutor autenticado mediante el token JWT.")
    public ResponseEntity<?> registrarMascota(@Valid @RequestBody MascotaRequestDTO dto) {
        try {
            Mascota mascotaGuardada = mascotaService.registrarMascota(dto);
            return new ResponseEntity<>(mascotaGuardada, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Listar mis mascotas", description = "Retorna una lista con todas las mascotas activas pertenecientes al tutor logueado en el sistema.")
    public ResponseEntity<List<Mascota>> listarMascotasPorTutor() {
        // 1. Sacamos el correo del token actual
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Buscamos al usuario y su tutor usando las instancias inyectadas
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        Tutor tutor = tutorRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        // 3. Traemos las mascotas del tutor que estén activas
        List<Mascota> lista = mascotaRepository.findByTutor_IdTutorAndEstadoMasc(tutor.getIdTutor(), 1);
        
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de la mascota", description = "Permite modificar la información de una mascota específica usando su ID.")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody MascotaRequestDTO dto) {
        mascotaService.modificarMascota(id, dto);
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Mascota actualizada correctamente");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar mascota (Soft Delete)", description = "Inhabilita lógicamente el perfil de la mascota en el sistema cambiando su estado.")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        mascotaService.borrarMascota(id);
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Mascota eliminada exitosamente");
        return ResponseEntity.ok(response);
    }
}