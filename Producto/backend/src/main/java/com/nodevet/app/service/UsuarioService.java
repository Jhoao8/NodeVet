package com.nodevet.app.service;

import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario registrarUsuario(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr(dto.getNombreUsr())
                .apellidoUsr(dto.getApellidoUsr())
                .correoUsr(dto.getCorreoUsr())
                // GUARDAMOS LA CONTRASEÑA EN TEXTO PLANO (SIN ENCRIPTAR POR AHORA)
                .passUsr(dto.getPassUsr()) 
                .telefonoUsr(dto.getTelefonoUsr())
                .estadoUsr(1) 
                .build();

        return usuarioRepository.save(nuevoUsuario);
    }

    // Este es el metodo que Spring Security exige para buscar usuarios en el login
    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        if (usuario.getEstadoUsr() == 0) {
            throw new RuntimeException("El usuario se encuentra inactivo.");
        }

        // Convertimos el Usuario a UserDetails que entiende Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getCorreoUsr())
                .password(usuario.getPassUsr()) // Spring comparará esto en texto plano
                .roles("USER") // Por ahora le damos un rol genérico
                .build();
    }
}