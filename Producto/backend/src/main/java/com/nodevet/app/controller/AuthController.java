package com.nodevet.app.controller;

import com.nodevet.app.dto.LoginRequestDTO;
import com.nodevet.app.dto.LoginResponseDTO;
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
}