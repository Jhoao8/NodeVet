package com.nodevet.app.repository;

import com.nodevet.app.model.Valor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ValorRepository extends JpaRepository<Valor, Integer> {
}