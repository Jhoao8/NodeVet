package com.nodevet.app.repository.consulta;

import com.nodevet.app.model.servicio.ExamServ;
import com.nodevet.app.model.servicio.ExamServId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamServRepository extends JpaRepository<ExamServ, ExamServId> {
}