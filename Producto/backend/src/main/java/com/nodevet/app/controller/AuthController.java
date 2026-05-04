package com.nodevet.app.controller;

import com.nodevet.app.dto.ForgotPasswordRequest;
import com.nodevet.app.dto.LoginRequestDTO;
import com.nodevet.app.dto.LoginResponseDTO;
import com.nodevet.app.dto.ResetPasswordRequest;
import com.nodevet.app.security.JwtUtil;
import com.nodevet.app.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getCorreoUsr(), dto.getPassUsr())
            );

            UserDetails userDetails = usuarioService.loadUserByUsername(dto.getCorreoUsr());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());

            return ResponseEntity.ok(new LoginResponseDTO(jwt));

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    // PANTALLA 1: Solicitar recuperación de contraseña
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            // Extraemos el correo desde el DTO
            String correo = request.getCorreo_usr();
            
            usuarioService.generarTokenRecuperacion(correo);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Si el correo existe, se ha enviado un enlace de recuperación.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Imprimimos el error en consola para depurar si algo sale mal
            e.printStackTrace(); 
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al procesar la solicitud: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // PANTALLA 2: Establecer nueva contraseña
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            // Usamos los datos del DTO
            usuarioService.restablecerPassword(request.getToken(), request.getNueva_pass());
            
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada exitosamente."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}