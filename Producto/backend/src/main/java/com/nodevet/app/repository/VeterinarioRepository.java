package com.nodevet.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.model.usuario.Veterinario;

import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Integer> {
    // Busca un perfil de Veterinario a partir de una entidad Usuario
    Optional<Veterinario> findByUsuario(Usuario usuario);
}
