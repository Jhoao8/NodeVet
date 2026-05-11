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
        
        // 1. Obtener el correo del usuario logueado desde el token JWT
        String correoUsuario = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Buscar al Usuario y luego a su Tutor
        Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        Tutor tutor = tutorRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("El usuario no tiene un perfil de Tutor válido"));

        // 3. Crear la mascota y asociarla AUTOMÁTICAMENTE al tutor
        Mascota nuevaMascota = Mascota.builder()
                .tutor(tutor)
                .nomMascota(dto.getNomMascota())
                .especie(dto.getEspecie())
                .raza(dto.getRaza())
                .sexo(dto.getSexo())
                .fecNac(dto.getFecNac())
                .estFecNac(dto.getEstFecNac() != null ? dto.getEstFecNac() : 0)
                .peso(dto.getPeso())
                .estadoMasc(1)
                .build();

        return mascotaRepository.save(nuevaMascota);
    }
}