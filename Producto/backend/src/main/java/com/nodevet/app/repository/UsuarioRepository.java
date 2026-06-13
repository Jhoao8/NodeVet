package com.nodevet.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nodevet.app.model.usuario.Usuario;

import java.util.Optional;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // Metodo clave para nuestras reglas de negocio
    // Buscar un usuario por su correo electrónico (para el login)
    Optional<Usuario> findByCorreoUsr(String correoUsr);
    
    // Validar si un correo ya esta registrado antes de crear uno nuevo
    boolean existsByCorreoUsr(String correoUsr);

    // Método para listar solo usuarios activos (o inactivos)
    List<Usuario> findAllByEstadoUsr(Integer estado);

    // Consulta para cambiar el estado a 0 (Soft Delete)
    @Modifying
    @Query("UPDATE Usuario u SET u.estadoUsr = 0 WHERE u.idUsuario = :idUsuario")
    void softDelete(@Param("idUsuario") Integer idUsuario);

}