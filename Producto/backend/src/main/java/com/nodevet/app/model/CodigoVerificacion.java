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
@Table(name = "CODIGO_VERIFICACION")
public class CodigoVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_codigo")
    private Integer idCodigo;

    @Column(length = 6, nullable = false)
    private String codigo;

    @Column(name = "fec_expiracion", nullable = false)
    private LocalDateTime fecExpiracion;

    // Relación 1 a 1 con Usuario (Unique)
    @OneToOne
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", unique = true, nullable = false)
    private Usuario usuario;

    @Column(name = "fec_creacion", updatable = false)
    private LocalDateTime fecCreacion;

    @PrePersist
    protected void onCreate() {
        fecCreacion = LocalDateTime.now();
    }
}