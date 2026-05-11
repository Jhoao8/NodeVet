package com.nodevet.app.repository;

import com.nodevet.app.model.Tutor;
import com.nodevet.app.model.Usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Integer> {
    Optional<Tutor> findByUsuario(Usuario usuario);
}