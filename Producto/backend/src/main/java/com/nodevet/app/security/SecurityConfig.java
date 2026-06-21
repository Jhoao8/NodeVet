package com.nodevet.app.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            
            // 1. CRITERIO DE ACEPTACION: Devolver 401 si no hay token o es inválido
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    // Configuramos el tipo de respuesta a JSON y el estatus a 401
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    
                    // Creamos el cuerpo del error manualmente
                    String jsonResponse = "{"
                        + "\"timestamp\": \"" + java.time.LocalDateTime.now() + "\","
                        + "\"status\": 401,"
                        + "\"error\": \"Unauthorized\","
                        + "\"mensaje\": \"Error 401: Token faltante o inválido en NodeVet\","
                        + "\"path\": \"" + request.getRequestURI() + "\""
                        + "}";
                        
                    response.getWriter().write(jsonResponse);
                })
            )
            
            // 2. JWT requiere que la sesion sea "Stateless" (sin estado)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth
                // 1. Mantenemos tus endpoints públicos
                .requestMatchers(
                    "/api/auth/**", // Cubre login, forgot-password, etc.
                    "/api/v1/usuarios/registro", // Registro de tutores,
                    "/swagger-ui/**", 
                    "/v3/api-docs/**", 
                    "/swagger-ui.html",
                    "/api/v1/pagos/confirmar",
                    "/api/v1/pagos/webhook"    // <--- ¡ESTA ES LA LÍNEA MÁGICA!
                ).permitAll()
                
                // 2. AÑADIMOS LAS REGLAS BASADAS EN ROLES
                // --- Mi Perfil ---
                .requestMatchers(HttpMethod.GET, "/api/v1/usuarios/perfil").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/usuarios/perfil").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/usuarios/perfil/foto").authenticated()
                
                // --- Gestión de Usuarios (Admin) ---
                // Dejamos pasar la petición aquí para que el @PreAuthorize del Controller 
                // haga la validación exacta del rol ADMIN.
                .requestMatchers("/api/v1/usuarios", "/api/v1/usuarios/**").authenticated()
                
                // Gestión de Usuarios (GET, PUT, DELETE): solo Admins.
                // El POST a /registro ya está permitido arriba.
                .requestMatchers(HttpMethod.GET, "/api/v1/usuarios", "/api/v1/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/usuarios/**").hasRole("ADMIN")

                // Mascotas: solo para Tutores
                .requestMatchers("/api/v1/mascotas/**").hasRole("TUTOR")
                .requestMatchers("/api/v1/reservas/**").hasRole("TUTOR")
                // === RUTAS DE PAGOS ===
                .requestMatchers("/api/v1/pagos/iniciar").hasRole("TUTOR")

                // === JORNADAS Y AGENDA: solo Admin puede configurar/generar ===
                .requestMatchers("/api/v1/jornadas/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/agendas").hasRole("ADMIN")

                // Especialidades:
                // Solo Admin crea (POST), Admin y Vet pueden leer (GET)
                .requestMatchers(HttpMethod.POST, "/api/v1/especialidades").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/especialidades").hasAnyRole("ADMIN", "VET")

                // Admins y Veterinarios: solo un ADMIN puede registrar nuevos
                .requestMatchers("/api/v1/admins/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/veterinarios/**").hasRole("ADMIN")
                
                // 3. Todo lo demás requiere token
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}