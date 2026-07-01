package com.nodevet.app.service.usuario;

import com.nodevet.app.dto.usuario.AdminRegistroDTO;
import com.nodevet.app.model.usuario.Admin;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.repository.AdminRepository;
import com.nodevet.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Admin> listarAdmins() {
        return adminRepository.findAll();
    }

    @Transactional
    public Admin crearAdmin(AdminRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

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

        Admin nuevoAdmin = new Admin(usuarioGuardado, dto.getNivelAcceso());
        
        return adminRepository.save(nuevoAdmin);
    }
}