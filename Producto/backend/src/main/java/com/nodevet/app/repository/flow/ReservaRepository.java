package com.nodevet.app.repository.flow;

import com.nodevet.app.model.flow.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    // Al heredar de JpaRepository, Spring Boot ya te regala métodos como findById(), findAll(), save(), delete(), etc.
}