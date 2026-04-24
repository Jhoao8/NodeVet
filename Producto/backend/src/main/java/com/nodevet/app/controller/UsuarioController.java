package com.nodevet.app.controller;

import com.nodevet.app.dto.LoginRequestDTO;
import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
// Si planeas conectar el frontend desde otro puerto local, 
// descomenta la siguiente línea para evitar errores de CORS:
// @CrossOrigin(origins = "*") 
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody UsuarioRegistroDTO dto) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(dto);
            
            // Nunca devolvemos la contraseña (ni siquiera la entidad entera idealmente), 
            // armamos un JSON de respuesta limpio.
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

    @PostMapping("/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody LoginRequestDTO dto) {
        try {
            Usuario usuario = usuarioService.autenticarUsuario(dto.getCorreoUsr(), dto.getPassUsr());
            
            // Más adelante, aqui generaremos un Token JWT. Por ahora devolvemos los datos basicos.
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Login exitoso");
            response.put("nombre", usuario.getNombreUsr());
            response.put("correo", usuario.getCorreoUsr());
            // response.put("token", "aqui_ira_el_token_jwt_pronto");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }
}