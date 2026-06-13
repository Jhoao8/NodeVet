package com.nodevet.app.repository;

import com.nodevet.app.model.CodigoVerificacion;
import com.nodevet.app.model.usuario.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Integer> {
    Optional<CodigoVerificacion> findByUsuario(Usuario usuario);
}