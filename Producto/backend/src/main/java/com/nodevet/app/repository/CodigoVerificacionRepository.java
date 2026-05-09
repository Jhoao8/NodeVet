package com.nodevet.app.repository;

import com.nodevet.app.model.CodigoVerificacion;
import com.nodevet.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Integer> {
    Optional<CodigoVerificacion> findByUsuario(Usuario usuario);
}