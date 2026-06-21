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
@Table(name = "VAC_SERV")
public class VacServ {

    @EmbeddedId
    private VacServId id;

    @ManyToOne
    @MapsId("idVac")
    @JoinColumn(name = "id_vac")
    private Vacuna vacuna;

    @ManyToOne
    @MapsId("idServ")
    @JoinColumn(name = "id_serv")
    private Servicio servicio;
}