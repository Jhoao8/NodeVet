package com.nodevet.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ADMIN")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_admin")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "nivel_acceso", nullable = false, length = 50)
    private String nivelAcceso; // Ej: "SUPER_ADMIN", "MODERADOR"

    public Admin(Usuario usuario, String nivelAcceso) {
        this.usuario = usuario;
        this.nivelAcceso = nivelAcceso;
    }
}
