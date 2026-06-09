package com.nodevet.app.repository;

import com.nodevet.app.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {
    // Spring Data JPA ya proporciona métodos CRUD básicos (save, findById, findAll, delete, etc.)
}