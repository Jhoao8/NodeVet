package com.nodevet.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // 1. Spring inyecta el valor desde el application.properties aquí
    @Value("${jwt.secret}")
    private String secretSeed;

    // Ya no es static final, se inicializa dinámicamente
    private Key secretKey;
    
    // Constantes para facilitar el uso en el Controller y Filtro (en milisegundos)
    public static final long EXPIRE_MOBILE = 1000L * 60 * 60 * 24 * 30; // 30 días
    public static final long EXPIRE_WEB = 1000L * 60 * 60 * 8;          // 8 horas

    // 2. Se ejecuta automáticamente justo después de que Spring inyecta el secretSeed
    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretSeed.getBytes());
    }

    // Genera un JWT con expiración dinámica según el cliente (Web o Móvil)
    public String generateToken(String username, long expirationMillis) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(secretKey)
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
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}