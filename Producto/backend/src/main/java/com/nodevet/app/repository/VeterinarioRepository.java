package com.nodevet.app.repository;

import com.nodevet.app.model.Usuario;
import com.nodevet.app.model.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {
    // Busca un perfil de Veterinario a partir de una entidad Usuario
    Optional<Veterinario> findByUsuario(Usuario usuario);
}
