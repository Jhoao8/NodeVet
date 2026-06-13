package com.nodevet.app.model.agenda;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ESTADO_BLOQUE")
public class EstadoBloque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_est_bloque")
    private Integer idEstBloque;

    @Column(name = "nom_est_bloque", length = 20, nullable = false)
    private String nomEstBloque;
}