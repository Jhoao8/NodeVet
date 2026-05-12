package com.nodevet.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Cambiamos a una llave basada en una semilla fija para que los tokens sobrevivan a reinicios del servidor
    private static final String SECRET_SEED = "TuPalabraSecretaSuperSeguraParaNodeVet2026_Portafolio"; 
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_SEED.getBytes());
    
    // Constantes para facilitar el uso en el Controller y Filtro (en milisegundos)
    public static final long EXPIRE_MOBILE = 1000L * 60 * 60 * 24 * 30; // 30 días
    public static final long EXPIRE_WEB = 1000L * 60 * 60 * 8;          // 8 horas

    // Genera un JWT con expiración dinámica según el cliente (Web o Móvil)
    public String generateToken(String username, long expirationMillis) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Genera un token nuevo basándose en uno anterior, manteniendo la duración correspondiente
    public String refreshToken(String token, long expirationMillis) {
        final String username = extractUsername(token);
        return generateToken(username, expirationMillis);
    }

    // Valida que el token coincida con el usuario y aún no haya expirado
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}