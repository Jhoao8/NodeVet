package com.nodevet.app.model.usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

import com.nodevet.app.model.Especialidad;

@Entity
@Table(name = "VETERINARIO")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Veterinario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vet")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "run_vet", nullable = false)
    private Integer runVet;

    @Column(name = "dv_vet", nullable = false, length = 1)
    private String dvVet;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "VET_ESP",
        joinColumns = @JoinColumn(name = "id_vet"),
        inverseJoinColumns = @JoinColumn(name = "id_esp")
    )
    private Set<Especialidad> especialidades = new HashSet<>();
}
