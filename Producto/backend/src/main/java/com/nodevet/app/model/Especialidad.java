package com.nodevet.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ESPECIALIDAD")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Especialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_esp")
    private Long id;

    @Column(name = "nom_esp", nullable = false, unique = true, length = 100)
    private String nombre;

    // Constructor útil para crear especialidades rápidamente
    public Especialidad(String nombre) {
        this.nombre = nombre;
    }
}
