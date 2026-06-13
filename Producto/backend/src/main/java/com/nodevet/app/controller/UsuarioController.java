package com.nodevet.app.controller;

import com.nodevet.app.dto.usuario.UsuarioDTO;
import com.nodevet.app.dto.usuario.UsuarioRegistroDTO;
import com.nodevet.app.dto.usuario.UsuarioUpdateDTO;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.service.usuario.UsuarioService;
import com.nodevet.app.util.DtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Dejamos la ruta protegida de prueba aqui (ya que pertenece a usuarios)
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfilProtegido() {
        return ResponseEntity.ok("¡Éxito! Has entrado a una ruta protegida usando tu Token JWT.");
    }
}