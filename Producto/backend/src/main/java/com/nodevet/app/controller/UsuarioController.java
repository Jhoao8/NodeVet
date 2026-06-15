package com.nodevet.app.controller;

import com.nodevet.app.dto.usuario.UsuarioDTO;
import com.nodevet.app.dto.usuario.UsuarioRegistroDTO;
import com.nodevet.app.dto.usuario.UsuarioUpdateDTO;
import com.nodevet.app.dto.FotoUpdateDTO;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.service.usuario.UsuarioService;
import com.nodevet.app.util.DtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    // ════════ ENDPOINTS PARA LA APP MÓVIL (MI PERFIL) ════════

    /**
     * Obtiene los datos del perfil del usuario logueado en la aplicación móvil.
     * Lee el correo directamente desde el token JWT por seguridad.
     */
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerMiPerfil() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName(); // El correo viaja en el token
            
            // Usamos un método (que debes asegurar de tener en el Service o buscar directo en Repo)
            // Por simplicidad en la respuesta, puedes llamar al mapeador si ya tienes un método de buscar por correo
            return usuarioService.obtenerUsuarioPorCorreo(correo)
                    .map(usuario -> {
                        // El frontend espera: nombreCompleto, correoUsr, telefonoUsr, fotoUsr
                        Map<String, String> response = new HashMap<>();
                        response.put("nombreCompleto", usuario.getNombreUsr() + " " + usuario.getApellidoUsr());
                        response.put("correoUsr", usuario.getCorreoUsr());
                        response.put("telefonoUsr", usuario.getTelefonoUsr());
                        response.put("fotoUsr", usuario.getFotoUsr());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al cargar el perfil");
        }
    }

    /**
     * Actualiza la información del perfil del usuario logueado.
     */
    @PutMapping("/actualizar")
    public ResponseEntity<?> actualizarMiPerfil(@Valid @RequestBody UsuarioUpdateDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName();
            
            // Llama al servicio para que busque por correo y actualice
            usuarioService.actualizarUsuarioPorCorreo(correo, dto);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Perfil actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Actualiza únicamente la foto de perfil del usuario logueado.
     */
    @PutMapping("/actualizar-foto")
    public ResponseEntity<?> actualizarMiFotoPerfil(@RequestBody FotoUpdateDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName();
            
            usuarioService.actualizarFotoPerfil(correo, dto.getFotoUsr());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Foto de perfil actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ════════ ENDPOINTS CRUD PARA GESTIÓN (ADMIN) ════════

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
    public ResponseEntity<?> actualizarUsuarioAdmin(@PathVariable Integer id, @Valid @RequestBody UsuarioUpdateDTO dto) {
        Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, dto);
        return ResponseEntity.ok(DtoMapper.toUsuarioDTO(usuarioActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarUsuario(@PathVariable Integer id) {
        usuarioService.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}