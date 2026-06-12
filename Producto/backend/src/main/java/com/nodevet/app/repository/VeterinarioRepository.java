package com.nodevet.app.repository;

import com.nodevet.app.model.Usuario;
import com.nodevet.app.model.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Integer> {
    // Busca un perfil de Veterinario a partir de una entidad Usuario
    Optional<Veterinario> findByUsuario(Usuario usuario);
}
