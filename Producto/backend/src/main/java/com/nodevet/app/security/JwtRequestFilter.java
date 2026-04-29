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
            
            // Cargamos los datos del usuario desde la base de datos
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 4. Validar el token
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                
                // Creamos el objeto de autenticación de Spring
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 5. Establecemos la autenticación en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 6. Dejar que la petición continúe su camino hacia el controlador
        chain.doFilter(request, response);
    }
}