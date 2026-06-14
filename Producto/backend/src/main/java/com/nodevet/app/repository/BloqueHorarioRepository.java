package com.nodevet.app.repository;

import com.nodevet.app.model.BloqueHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Integer> {
}
