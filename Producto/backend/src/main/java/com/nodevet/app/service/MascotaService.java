package com.nodevet.app.service;

import com.nodevet.app.dto.MascotaRequestDTO;
import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.Tutor;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.MascotaRepository;
import com.nodevet.app.repository.TutorRepository;
import com.nodevet.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TutorRepository tutorRepository;

    @Transactional
    public Mascota registrarMascota(MascotaRequestDTO dto) {
        Tutor tutor = obtenerTutorActual();

        Mascota nuevaMascota = Mascota.builder()
                .tutor(tutor)
                .nomMascota(dto.getNomMascota())
                .especie(dto.getEspecie())
                .raza(dto.getRaza())
                .sexo(dto.getSexo())
                .fecNac(dto.getFecNac())
                .estFecNac(dto.getEstFecNac() != null ? dto.getEstFecNac() : 0)
                .peso(dto.getPeso())
                .imagenMascota(dto.getImagenMascota()) // Guardamos la URL de Cloudinary
                .estadoMasc(1)
                .build();

        return mascotaRepository.save(nuevaMascota);
    }

    @Transactional
    public Mascota modificarMascota(Integer id, MascotaRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        mascota.setNomMascota(dto.getNomMascota());
        mascota.setEspecie(dto.getEspecie());
        mascota.setRaza(dto.getRaza());
        mascota.setSexo(dto.getSexo());
        mascota.setPeso(dto.getPeso());
        mascota.setFecNac(dto.getFecNac());
        mascota.setEstFecNac(dto.getEstFecNac());        
        if (dto.getImagenMascota() != null) {
            mascota.setImagenMascota(dto.getImagenMascota());
        }

        return mascotaRepository.save(mascota);
    }

    @Transactional
    public void borrarMascota(Integer id) {
        mascotaRepository.softDelete(id);
    }

    private Tutor obtenerTutorActual() {
        String correoUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return tutorRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("Perfil de Tutor no válido"));
    }
}