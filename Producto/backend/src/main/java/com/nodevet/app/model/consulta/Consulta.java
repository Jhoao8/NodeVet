package com.nodevet.app.model.consulta;

import com.nodevet.app.model.reserva.Reserva;
import com.nodevet.app.model.Valor; 
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
@Table(name = "CONSULTA")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Integer idConsulta;

    @OneToOne
    @JoinColumn(name = "id_reserva", referencedColumnName = "id_reserva", unique = true, nullable = false)
    private Reserva reserva;

    @ManyToOne
    @JoinColumn(name = "id_valor", nullable = false)
    private Valor valor;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "diagnostico", columnDefinition = "TEXT")
    private String diagnostico;

    @Column(name = "indicacion_receta", columnDefinition = "TEXT")
    private String indicacionReceta;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "fec_creacion", insertable = false, updatable = false)
    private LocalDateTime fecCreacion;

    @Column(name = "fec_actualizacion", insertable = false, updatable = false)
    private LocalDateTime fecActualizacion;

    @PrePersist
    public void prePersist() {
        if (isDeleted == null) {
            isDeleted = false;
        }
    }
}