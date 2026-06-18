package com.nodevet.app.repository.consulta;

import com.nodevet.app.model.servicio.VacServ;
import com.nodevet.app.model.servicio.VacServId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacServRepository extends JpaRepository<VacServ, VacServId> {
}