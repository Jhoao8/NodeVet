package com.nodevet.app.controller;

import com.nodevet.app.dto.ForgotPasswordRequest;
import com.nodevet.app.dto.LoginRequestDTO;
import com.nodevet.app.dto.LoginResponseDTO;
import com.nodevet.app.dto.ResetPasswordRequest;
import com.nodevet.app.dto.VerifyCodeRequest; 
import com.nodevet.app.security.JwtUtil;
import com.nodevet.app.service.usuario.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Autenticación", description = "Gestión de acceso y seguridad. Endpoints públicos para el inicio de sesión y el flujo de recuperación de contraseñas mediante códigos OTP.")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida las credenciales del usuario y devuelve un token JWT. El tiempo de expiración del token varía si el origen es la App Móvil (30 días) o la Web (8 horas).")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        try {
            // 1. Autenticación estándar
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getCorreoUsr(), dto.getPassUsr())
            );

            // 2. Cargar detalles del usuario
            UserDetails userDetails = usuarioService.loadUserByUsername(dto.getCorreoUsr());

            // 3. Lógica de expiración diferenciada (App vs Web)
            long expiracion = dto.isMobile() ? JwtUtil.EXPIRE_MOBILE : JwtUtil.EXPIRE_WEB;

            // 4. Generar el token con el tiempo correspondiente
            String jwt = jwtUtil.generateToken(userDetails.getUsername(), expiracion);

            return ResponseEntity.ok(new LoginResponseDTO(jwt));

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Credenciales inválidas");
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    // PANTALLA 1: Solicitar recuperación (Envía el correo con el código)
    @PostMapping("/recuperacion")
    @Operation(summary = "Solicitar código de recuperación", description = "Paso 1 del flujo de olvido de contraseña. Si el correo existe en el sistema, genera y envía un código OTP de 6 dígitos al correo del usuario.")
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
    @PostMapping("/verificacion")
    @Operation(summary = "Verificar código OTP", description = "Paso 2 del flujo. Valida que el código de 6 dígitos ingresado coincida con el enviado al correo y que no haya expirado (ventana de 15 minutos).")
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
    @PutMapping("/password")
    @Operation(summary = "Restablecer contraseña", description = "Paso 3 y final. Permite definir la nueva contraseña exigiendo nuevamente el código OTP como medida de seguridad para evitar peticiones fraudulentas.")
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