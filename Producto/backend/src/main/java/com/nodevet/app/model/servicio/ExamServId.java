package com.nodevet.app.model.servicio;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ExamServId implements Serializable {

    @Column(name = "id_exam")
    private Integer idExam;

    @Column(name = "id_serv")
    private Integer idServ;
}