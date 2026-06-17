package com.nodevet.app.service;

import com.nodevet.app.model.Especialidad;
import com.nodevet.app.repository.EspecialidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    public Especialidad crearEspecialidad(String nombre) {
        Especialidad nuevaEspecialidad = new Especialidad(nombre);
        return especialidadRepository.save(nuevaEspecialidad);
    }

    public List<Especialidad> obtenerTodas() {
        return especialidadRepository.findAll();
    }

    // Aquí podrías agregar métodos para actualizar y eliminar especialidades.
}
