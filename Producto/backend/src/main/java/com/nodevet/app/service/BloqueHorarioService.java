package com.nodevet.app.service;

import com.nodevet.app.dto.BloqueHorarioRequestDTO;
import com.nodevet.app.model.BloqueHorario;
import com.nodevet.app.repository.BloqueHorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BloqueHorarioService {

    private final BloqueHorarioRepository bloqueHorarioRepository;

    public BloqueHorario registrarBloque(BloqueHorarioRequestDTO dto) {
        BloqueHorario bloque = BloqueHorario.builder()
                .fecHrInicio(dto.getFecHrInicio())
                .fecHrFin(dto.getFecHrFin())
                .idVet(dto.getIdVet())
                .idEstBloque(dto.getIdEstBloque() != null ? dto.getIdEstBloque() : 1)
                .build();
        return bloqueHorarioRepository.save(bloque);
    }
}
