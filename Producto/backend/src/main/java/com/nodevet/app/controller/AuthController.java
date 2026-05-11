package com.nodevet.app.controller;

import com.nodevet.app.dto.ForgotPasswordRequest;
import com.nodevet.app.dto.LoginRequestDTO;
import com.nodevet.app.dto.LoginResponseDTO;
import com.nodevet.app.dto.ResetPasswordRequest;
import com.nodevet.app.dto.VerifyCodeRequest; 
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

    // PANTALLA 1: Solicitar recuperación (Envía el correo con el código)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String correo = request.getCorreo_usr();
            usuarioService.generarTokenRecuperacion(correo);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Si el correo existe, se ha enviado un código de recuperación.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace(); 
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al procesar la solicitud: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // PANTALLA 1 (Paso 2): Verificar si el código ingresado es correcto
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            // Validamos que el código coincida y no esté expirado
            usuarioService.validarCodigoOTP(request.getCorreo_usr(), request.getCodigo());
            
            return ResponseEntity.ok(Map.of("mensaje", "Código validado exitosamente."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PANTALLA 2: Establecer nueva contraseña
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            // Pasamos el correo, el código (como doble verificación) y la nueva contraseña
            usuarioService.restablecerPassword(request.getCorreo_usr(), request.getCodigo(), request.getNueva_pass());
            
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada exitosamente."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}