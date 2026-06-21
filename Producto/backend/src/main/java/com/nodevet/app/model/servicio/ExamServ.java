package com.nodevet.app.model.servicio;

import com.nodevet.app.model.servicio.examen.Examen;

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
@Table(name = "EXAM_SERV")
public class ExamServ {

    @EmbeddedId
    private ExamServId id;

    @ManyToOne
    @MapsId("idExam")
    @JoinColumn(name = "id_exam")
    private Examen examen;

    @ManyToOne
    @MapsId("idServ")
    @JoinColumn(name = "id_serv")
    private Servicio servicio;
}