package com.nodevet.app.repository;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.nodevet.app.model.usuario.Admin;
import com.nodevet.app.model.usuario.Usuario;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    // Busca un perfil de Admin a partir de una entidad Usuario
    Optional<Admin> findByUsuario(Usuario usuario);
    @Query(value = "SELECT COUNT(*) FROM admin WHERE id_usuario = :idUsuario", nativeQuery = true)
    int checkIsAdmin(@Param("idUsuario") Integer idUsuario);
    
}
