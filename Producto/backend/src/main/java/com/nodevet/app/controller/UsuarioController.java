package com.nodevet.app.controller;

import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.dto.UsuarioUpdateDTO;
import com.nodevet.app.dto.FotoUpdateDTO;
import com.nodevet.app.dto.UsuarioDTO;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.UsuarioRepository;
import com.nodevet.app.service.UsuarioService;
import com.nodevet.app.util.DtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody UsuarioRegistroDTO dto) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Usuario registrado con éxito");
            response.put("idUsuario", nuevoUsuario.getIdUsuario());
            response.put("correo", nuevoUsuario.getCorreoUsr());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // --- ENDPOINTS CRUD PARA GESTIÓN (PROTEGIDOS PARA ADMIN) ---

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarUsuariosActivos();
        List<UsuarioDTO> dtos = usuarios.stream()
                .map(DtoMapper::toUsuarioDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable Integer id) {
        return usuarioService.obtenerUsuarioPorId(id)
                .map(usuario -> ResponseEntity.ok(DtoMapper.toUsuarioDTO(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Integer id, @Valid @RequestBody UsuarioUpdateDTO dto) {
        Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, dto);
        return ResponseEntity.ok(DtoMapper.toUsuarioDTO(usuarioActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarUsuario(@PathVariable Integer id) {
        usuarioService.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO> obtenerPerfil(Authentication authentication) {
        // 1. Obtener el correo o ID del usuario autenticado desde el token
        String correoUsuario = authentication.getName(); 
        
        // 2. Buscar el usuario en la base de datos
        Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
        // 3. Mapear la entidad Usuario a UsuarioDTO
        UsuarioDTO dto = new UsuarioDTO();
        dto.setNombreCompleto(usuario.getNombreUsr() + " " + usuario.getApellidoUsr());
        dto.setCorreoUsr(usuario.getCorreoUsr());
        dto.setTelefonoUsr(usuario.getTelefonoUsr());
        dto.setFotoUsr(usuario.getFotoUsr()); // ¡Asegúrate de haber agregado fotoUsr al DTO!
        dto.setEstadoUsr(usuario.getEstadoUsr());
        
        // 4. Devolver el DTO en formato JSON
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/actualizar-foto")
    public ResponseEntity<?> actualizarFoto(@RequestBody FotoUpdateDTO dto, Authentication authentication) {
        try {
            // Extraer el correo del token
            String correoUsuario = authentication.getName(); 
            
            // Actualizar la foto en la base de datos
            usuarioService.actualizarFotoPerfil(correoUsuario, dto.getFotoUsr());
            
            // Respuesta de éxito
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Foto de perfil actualizada correctamente");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/actualizar")
    public ResponseEntity<?> actualizarMiPerfil(@RequestBody UsuarioUpdateDTO dto, Authentication authentication) {
        try {
            // 1. Extraemos el correo del token (quién está haciendo la petición)
            String correoUsuario = authentication.getName(); 
            
            // 2. Buscamos al usuario en la BD
            Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
            // 3. Actualizamos sus datos con lo que llegó del frontend
            usuario.setNombreUsr(dto.getNombreUsr());
            usuario.setApellidoUsr(dto.getApellidoUsr());
            usuario.setTelefonoUsr(dto.getTelefonoUsr());
            usuario.setCorreoUsr(dto.getCorreoUsr()); 
            
            usuarioRepository.save(usuario);
            
            // 4. Devolvemos mensaje de éxito
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Perfil actualizado correctamente");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}