package com.nodevet.app.repository;

import com.nodevet.app.model.consulta.ArchivoAdjunto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArchivoAdjuntoRepository extends JpaRepository<ArchivoAdjunto, Integer> {
    
    // Para cuando necesites listar todos los documentos de una atención
    List<ArchivoAdjunto> findByConsulta_IdConsulta(Integer idConsulta);
}