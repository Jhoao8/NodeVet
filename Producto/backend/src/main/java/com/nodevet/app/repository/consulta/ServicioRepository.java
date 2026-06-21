package com.nodevet.app.repository.consulta;

import com.nodevet.app.model.servicio.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Integer> {
}