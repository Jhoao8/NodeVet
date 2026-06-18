package com.nodevet.app.model.servicio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "SERVICIO")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_serv")
    private Integer idServ;
    
    // Al ser una tabla central, más adelante aquí irán las relaciones @OneToMany 
    // hacia las tablas puente (VAC_SERV, EXAM_SERV), pero por ahora la dejamos así.
}