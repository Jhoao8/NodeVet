package com.nodevet.app.repository;

import com.nodevet.app.model.servicio.examen.Examen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamenRepository extends JpaRepository<Examen, Integer> {
}