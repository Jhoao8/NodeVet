package com.nodevet.app.service.usuario;

import com.nodevet.app.dto.usuario.VeterinarioRegistroDTO;
import com.nodevet.app.model.Especialidad;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.model.usuario.Veterinario;
import com.nodevet.app.repository.EspecialidadRepository;
import com.nodevet.app.repository.UsuarioRepository;
import com.nodevet.app.repository.VeterinarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VeterinarioService {

    private final UsuarioRepository usuarioRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final EspecialidadRepository especialidadRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Veterinario registrarVeterinario(VeterinarioRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

        // 1. Crear y guardar la entidad Usuario
        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr(dto.getNombreUsr())
                .apellidoUsr(dto.getApellidoUsr())
                .correoUsr(dto.getCorreoUsr())
                .passUsr(passwordEncoder.encode(dto.getPassUsr()))
                .telefonoUsr(dto.getTelefonoUsr())
                .fotoUsr(dto.getFotoUsr())
                .estadoUsr(1)
                .build();
        
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 2. Buscar las especialidades por sus IDs
        Set<Especialidad> especialidades = new HashSet<>();
        if (dto.getEspecialidadesIds() != null && !dto.getEspecialidadesIds().isEmpty()) {
            List<Especialidad> encontradas = especialidadRepository.findAllById(dto.getEspecialidadesIds());
            especialidades.addAll(encontradas);
        }

        // 3. Crear y guardar la entidad Veterinario
        Veterinario nuevoVeterinario = new Veterinario();
        nuevoVeterinario.setUsuario(usuarioGuardado);
        nuevoVeterinario.setRunVet(dto.getRunVet());
        nuevoVeterinario.setDvVet(dto.getDvVet());
        nuevoVeterinario.setEspecialidades(especialidades);

        return veterinarioRepository.save(nuevoVeterinario);
    }
}
