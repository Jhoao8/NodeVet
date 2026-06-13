package com.nodevet.app.repository.agenda;

import com.nodevet.app.model.agenda.Jornada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JornadaRepository extends JpaRepository<Jornada, Integer> {
    
    List<Jornada> findByVeterinarioIdAndEstJornada(Integer id, Integer estJornada);
}