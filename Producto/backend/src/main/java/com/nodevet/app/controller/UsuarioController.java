package com.nodevet.app.controller;

import com.nodevet.app.dto.usuario.UsuarioDTO;
import com.nodevet.app.dto.usuario.CambioPasswordRequestDTO;
import com.nodevet.app.dto.usuario.UsuarioRegistroDTO;
import com.nodevet.app.dto.usuario.UsuarioUpdateDTO;
import com.nodevet.app.dto.reserva.ResumenTutorReservasDTO;
import com.nodevet.app.dto.FotoUpdateDTO;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.service.ReservaService;
import com.nodevet.app.service.usuario.UsuarioService;
import com.nodevet.app.util.DtoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de cuentas y perfiles. Incluye el registro público, manejo de perfil personal (App/Web) y panel de administración (solo Admin).")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ReservaService reservaService;

    // ════════ PÚBLICO ════════

    @PostMapping("/registro")
    @Operation(summary = "Registrar nuevo usuario público (Tutor)", description = "Crea una nueva cuenta en la plataforma y le asigna automáticamente el rol de Tutor. Endpoint público.")
    public ResponseEntity<?> registrarUsuario(@RequestBody UsuarioRegistroDTO dto) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Usuario registrado con éxito");
            response.put("idUsuario", nuevoUsuario.getIdUsuario());
            response.put("correo", nuevoUsuario.getCorreoUsr());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (ResponseStatusException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getReason());
            return new ResponseEntity<>(error, e.getStatusCode());
        }
    }

    // ════════ MI CUENTA (Requiere Token) ════════

    @GetMapping("/perfil")
    @Operation(summary = "Obtener mi perfil", description = "Devuelve los datos personales del usuario logueado leyendo el correo directamente desde el token JWT de seguridad.")
    public ResponseEntity<?> obtenerMiPerfil() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String correo = authentication.getName(); 
        
        return usuarioService.obtenerUsuarioPorCorreo(correo)
                .map(usuario -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("nombreCompleto", usuario.getNombreUsr() + " " + usuario.getApellidoUsr());
                    response.put("correoUsr", usuario.getCorreoUsr());
                    response.put("telefonoUsr", usuario.getTelefonoUsr());
                    response.put("fotoUsr", usuario.getFotoUsr());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/perfil")
    @Operation(summary = "Actualizar mi perfil", description = "Permite al usuario logueado modificar sus datos personales básicos.")
    public ResponseEntity<?> actualizarMiPerfil(@Valid @RequestBody UsuarioUpdateDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName();
            
            usuarioService.actualizarUsuarioPorCorreo(correo, dto);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Perfil actualizado correctamente");
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @PutMapping("/perfil/foto")
    @Operation(summary = "Actualizar mi foto", description = "Actualiza únicamente la URL de la imagen de perfil del usuario logueado en base a su token.")
    public ResponseEntity<?> actualizarMiFotoPerfil(@RequestBody FotoUpdateDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName();
            
            usuarioService.actualizarFotoPerfil(correo, dto.getFotoUsr());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Foto de perfil actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @PutMapping("/perfil/password")
    @Operation(summary = "Cambiar mi contraseña", description = "Permite al usuario autenticado cambiar su contraseña validando primero su contraseña actual.")
    public ResponseEntity<?> cambiarMiPassword(@RequestBody CambioPasswordRequestDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName();

            usuarioService.cambiarPasswordAutenticado(correo, dto.getPasswordActual(), dto.getNuevaPassword());

            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @DeleteMapping("/perfil")
    @Operation(summary = "Desactivar mi cuenta", description = "Inhabilita la cuenta del usuario autenticado aplicando soft delete, sin eliminar sus datos históricos.")
    public ResponseEntity<Void> desactivarMiCuenta() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String correo = authentication.getName();

            Usuario usuario = usuarioService.obtenerUsuarioPorCorreo(correo)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

            usuarioService.desactivarUsuario(usuario.getIdUsuario());
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    // ════════ ADMINISTRACIÓN (Solo ADMIN) ════════

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(summary = "Listar todos los usuarios activos", description = "Devuelve una lista con todos los usuarios registrados en el sistema. Acción exclusiva para Administradores.")
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios(
            @RequestParam(name = "incluirInactivos", required = false, defaultValue = "false") boolean incluirInactivos) {
        List<Usuario> usuarios = usuarioService.listarUsuarios(incluirInactivos);
        List<UsuarioDTO> dtos = usuarios.stream()
                .map(DtoMapper::toUsuarioDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Busca los detalles de un usuario específico usando su identificador. Acción exclusiva para Administradores.")
    public ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable Integer id) {
        return usuarioService.obtenerUsuarioPorId(id)
                .map(usuario -> ResponseEntity.ok(DtoMapper.toUsuarioDTO(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

            @PreAuthorize("hasRole('ADMIN')")
            @GetMapping("/{id}/resumen-reservas")
            @Operation(summary = "Resumen de reservas por tutor", description = "Devuelve métricas de reservas realizadas, asistidas y ausentadas para el tutor asociado al usuario indicado.")
            public ResponseEntity<ResumenTutorReservasDTO> obtenerResumenReservasTutor(@PathVariable Integer id) {
            return usuarioService.obtenerUsuarioPorId(id)
                .map(usuario -> ResponseEntity.ok(
                    reservaService.obtenerResumenTutor(
                        usuario.getIdUsuario(),
                        usuario.getNombreUsr() + " " + usuario.getApellidoUsr()
                    )
                ))
                .orElse(ResponseEntity.notFound().build());
            }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario (Admin)", description = "Permite a un administrador forzar la modificación de los datos de cualquier usuario.")
    public ResponseEntity<?> actualizarUsuarioAdmin(@PathVariable Integer id, @Valid @RequestBody UsuarioUpdateDTO dto) {
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, dto);
            return ResponseEntity.ok(DtoMapper.toUsuarioDTO(usuarioActualizado));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar usuario (Soft Delete)", description = "Inhabilita la cuenta de un usuario cambiando su estado, sin borrar sus registros históricos. Acción exclusiva para Administradores.")
    public ResponseEntity<Void> desactivarUsuario(@PathVariable Integer id) {
        try {
            usuarioService.desactivarUsuario(id);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/activar")
    @Operation(summary = "Activar usuario", description = "Reactiva la cuenta de un usuario inactivo cambiando su estado a activo. Acción exclusiva para Administradores.")
    public ResponseEntity<Void> activarUsuario(@PathVariable Integer id) {
        try {
            usuarioService.activarUsuario(id);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.notFound().build();
        }
    }
}