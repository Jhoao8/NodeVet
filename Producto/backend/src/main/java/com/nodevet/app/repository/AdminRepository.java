package com.nodevet.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nodevet.app.model.usuario.Admin;
import com.nodevet.app.model.usuario.Usuario;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    // Busca un perfil de Admin a partir de una entidad Usuario
    Optional<Admin> findByUsuario(Usuario usuario);
}
