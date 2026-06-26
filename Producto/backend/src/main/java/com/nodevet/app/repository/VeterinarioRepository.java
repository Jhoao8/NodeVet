package com.nodevet.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.model.usuario.Veterinario;

import java.util.List;
import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Integer> {

    Optional<Veterinario> findByUsuario(Usuario usuario);

    boolean existsByRunVet(Integer runVet);

    // Trae todos los veterinarios con sus datos de usuario y especialidades
    // en una sola query para evitar LazyInitializationException
    @Query("SELECT v FROM Veterinario v JOIN FETCH v.usuario u JOIN FETCH v.especialidades")
    List<Veterinario> findAllConDetalles();
}