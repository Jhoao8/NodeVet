package com.nodevet.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;

@Component // Lo registramos como Bean para poder inyectar JwtUtil
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    // Este método se ejecuta una vez por cada petición HTTP que llega al servidor
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain chain)
            throws ServletException, IOException {

        // 1. Obtener la cabecera "Authorization" de la petición
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 2. Verificar que la cabecera exista y comience con "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Extraemos el token (quitamos "Bearer ")
            try {
                username = jwtUtil.extractUsername(jwt); // Usamos tu clase JwtUtil
            } catch (Exception e) {
                System.out.println("Token inválido o expirado: " + e.getMessage());
            }
        }

        // 3. Si hay un usuario en el token, pero aún no está autenticado en Spring Security
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                
                // --- LÓGICA DE REINICIO DE 30 DÍAS ---
                // Generamos un token fresquito con otros 30 días
                String newToken = jwtUtil.refreshToken(jwt, JwtUtil.EXPIRE_MOBILE);                // Lo enviamos en la respuesta. El frontend deberá guardarlo.
                response.setHeader("New-Token", newToken);
                // Exponemos el header para que CORS no lo bloquee en el navegador/app
                response.setHeader("Access-Control-Expose-Headers", "New-Token");
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }
}