package com.nodevet.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nodevet.app.model.usuario.Tutor;
import com.nodevet.app.model.usuario.Usuario;

public interface TutorRepository extends JpaRepository<Tutor, Integer> {
    Optional<Tutor> findByUsuario(Usuario usuario);
}