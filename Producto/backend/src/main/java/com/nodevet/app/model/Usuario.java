package com.nodevet.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "USUARIO")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "nombre_usr", length = 75, nullable = false)
    private String nombreUsr;

    @Column(name = "apellido_usr", length = 75, nullable = false)
    private String apellidoUsr;

    @Column(name = "correo_usr", length = 150, nullable = false, unique = true)
    private String correoUsr;

    @Column(name = "pass_usr", length = 255, nullable = false)
    private String passUsr;

    @Column(name = "telefono_usr", length = 12)
    private String telefonoUsr;

    @Column(name = "foto_usr", length = 255)
    private String fotoUsr;

    @Builder.Default
    @Column(name = "estado_usr", nullable = false)
    private Integer estadoUsr = 1;

    @Column(name = "fec_creacion", nullable = false, updatable = false)
    private LocalDateTime fecCreacion;

    // Antes de que se guarde por primera vez, asignamos la fecha actual
    @PrePersist
    protected void onCreate() {
        fecCreacion = LocalDateTime.now();
    }

}