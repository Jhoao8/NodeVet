package com.nodevet.app.controller;

import com.nodevet.app.dto.MascotaRequestDTO;
import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.Tutor;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.MascotaRepository; // Importante agregar este
import com.nodevet.app.repository.TutorRepository;
import com.nodevet.app.repository.UsuarioRepository;
import com.nodevet.app.service.MascotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mascotas")
@RequiredArgsConstructor 
public class MascotaController {

    private final MascotaService mascotaService;
    
    private final UsuarioRepository usuarioRepository;
    private final TutorRepository tutorRepository;
    private final MascotaRepository mascotaRepository;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarMascota(@Valid @RequestBody MascotaRequestDTO dto) {
        try {
            Mascota mascotaGuardada = mascotaService.registrarMascota(dto);
            return new ResponseEntity<>(mascotaGuardada, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Mascota>> listarMascotasPorTutor() {
        // 1. Sacamos el correo del token actual
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Buscamos al usuario y su tutor usando las instancias inyectadas (en minúscula)
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        Tutor tutor = tutorRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        // 3. Traemos las mascotas del tutor que estén activas
        List<Mascota> lista = mascotaRepository.findByTutor_IdTutorAndEstadoMasc(tutor.getIdTutor(), 1);
        
        return ResponseEntity.ok(lista);
    }
}