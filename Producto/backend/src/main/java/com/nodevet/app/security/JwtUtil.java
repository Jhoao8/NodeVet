package com.nodevet.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

// Registra la clase como un Bean de Spring
@Component
public class JwtUtil {

    // Llave secreta generada en memoria para firmar el token 
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Configurar expiracion estricta de 30 minutos (en milisegundos)
    private static final long EXPIRATION_TIME = 1000 * 60 * 30;

    // Crea un JWT con el username, fecha de creacion y fecha de expiracion
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Valida que el token coincida con el usuario y aun no haya expirado
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    // Extrae el nombre de usuario (subject) del contenido del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Verifica si la fecha de expiracion ya paso
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Extrae la fecha limite de validez del token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Metodo generico para desencriptar el token y obtener sus datos
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}