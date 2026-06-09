package com.nodevet.app.repository;

import com.nodevet.app.model.Admin;
import com.nodevet.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    // Busca un perfil de Admin a partir de una entidad Usuario
    Optional<Admin> findByUsuario(Usuario usuario);
}
