package com.nodevet.app.repository;

import com.nodevet.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // Metodo clave para nuestras reglas de negocio
    // Buscar un usuario por su correo electrónico (para el login)
    Optional<Usuario> findByCorreoUsr(String correoUsr);
    
    // Validar si un correo ya esta registrado antes de crear uno nuevo
    boolean existsByCorreoUsr(String correoUsr);

    // Busca al usuario por el token y verifica que la fecha de expiracion sea posterior a la actual
    Optional<Usuario> findByResetTokenAndTokenExpiresAfter(String token, LocalDateTime now);
}