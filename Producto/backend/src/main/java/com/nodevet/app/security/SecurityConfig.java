package com.nodevet.app.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
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
                // 1. Permitimos el login, registro y mantallas de recuperar contraseña
                .requestMatchers(
                    "/api/auth/login", 
                    "/api/v1/usuarios/registro",
                    "/api/auth/forgot-password",
                    "/api/auth/verify-code",
                    "/api/auth/reset-password"
                ).permitAll()
                
                // 2. Mantenemos Swagger publico
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                
                // 3. Todo lo demas requiere token
                .anyRequest().authenticated()
            );

        // 3. Reemplazamos Basic Auth poniendo nuestro filtro JWT antes del filtro de Spring
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 4. Permite a Spring usar el AuthenticationManager en nuestro AuthController
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 5. NUEVO: Le decimos a Spring Security que no encripte las contraseñas al comparar en el login
    @SuppressWarnings("deprecation")
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}