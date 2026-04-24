package com.nodevet.app.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Rutas publicas
                .requestMatchers("/api/v1/usuarios/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Todo lo demas requiere estar autenticado
                .anyRequest().authenticated()
            )
            // Habilitamos Basic Auth para poder probar el usuario admin
            .httpBasic(org.springframework.security.config.Customizer.withDefaults());

        return http.build();
    }

    // Creamos un usuario "admin" por defecto en memoria
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin = User.builder()
            .username("admin")
            .password("{noop}admin123") 
            .roles("ADMIN")
            .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
