package com.nodevet.app.service;

import com.nodevet.app.dto.MascotaRequestDTO;
import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.usuario.Tutor;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.repository.MascotaRepository;
import com.nodevet.app.repository.TutorRepository;
import com.nodevet.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
                .fecNacEst(dto.getFecNacEst() != null ? dto.getFecNacEst() : 0)
                .peso(dto.getPeso())
                .imagenMascota(dto.getImagenMascota()) // Guardamos la URL de Cloudinary
                .estadoMasc(1)
                .build();

        return mascotaRepository.save(nuevaMascota);
    }

    @Transactional
    public Mascota modificarMascota(Integer id, MascotaRequestDTO dto) {
        // 1. Identificamos quién es el tutor que está haciendo la petición
        Tutor tutorLogueado = obtenerTutorActual();

        // 2. Buscamos la mascota en la BD
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota no encontrada"));

        // 3. Verificamos que la mascota esté activa
        if (mascota.getEstadoMasc() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes modificar una mascota que ha sido dada de baja");
        }

        // 4. LA VALIDACIÓN CLAVE: Verificamos que los IDs coincidan (Anti-IDOR)
        if (!mascota.getTutor().getIdTutor().equals(tutorLogueado.getIdTutor())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para modificar esta mascota");
        }

        // 5. Si pasa todas las validaciones, procedemos a actualizar
        mascota.setNomMascota(dto.getNomMascota());
        mascota.setEspecie(dto.getEspecie());
        mascota.setRaza(dto.getRaza());
        mascota.setSexo(dto.getSexo());
        mascota.setPeso(dto.getPeso());
        mascota.setFecNac(dto.getFecNac());
        mascota.setFecNacEst(dto.getFecNacEst());        
        
        if (dto.getImagenMascota() != null) {
            mascota.setImagenMascota(dto.getImagenMascota());
        }

        return mascotaRepository.save(mascota);
    }

    @Transactional
    public void borrarMascota(Integer id) {
        // Aplicamos la misma barrera de seguridad para el borrado
        Tutor tutorLogueado = obtenerTutorActual();
        
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota no encontrada"));

        if (!mascota.getTutor().getIdTutor().equals(tutorLogueado.getIdTutor())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para eliminar esta mascota");
        }

        mascotaRepository.softDelete(id);
    }

    private Tutor obtenerTutorActual() {
        String correoUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado en el contexto de seguridad"));
        return tutorRepository.findByUsuario(usuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Perfil de Tutor no válido o inexistente"));
    }
}