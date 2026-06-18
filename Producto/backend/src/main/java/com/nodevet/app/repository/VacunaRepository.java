package com.nodevet.app.repository;

import com.nodevet.app.model.servicio.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacunaRepository extends JpaRepository<Vacuna, Integer> {
}