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

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    @Transactional
    public Usuario registrarUsuario(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr(dto.getNombreUsr())
                .apellidoUsr(dto.getApellidoUsr())
                .correoUsr(dto.getCorreoUsr())
                .passUsr(dto.getPassUsr()) 
                .telefonoUsr(dto.getTelefonoUsr())
                .estadoUsr(1)
                .build();

        return usuarioRepository.save(nuevoUsuario);
    }

    // --- METODOS PARA RECUPERAR CONTRASEÑA ---

    @Transactional
    public void generarTokenRecuperacion(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("No se encontró un usuario con ese correo."));

        // Generamos el token UUID
        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        
        // Expiracion de 1 hora
        usuario.setTokenExpires(LocalDateTime.now().plusHours(1));

        usuarioRepository.save(usuario);
        
        // ENVÍO REAL DE CORREO
        // Esto cumple con el detalle de "instrucciones directas" de tu Trello
        emailService.enviarCorreoRecuperacion(correo, token);
        
        System.out.println("DEBUG - Correo enviado a: " + correo);
    }

    @Transactional
    public void restablecerPassword(String token, String nuevaPassword) {
        // Validamos que el token exista y no haya expirado (Criterio: Validaciones tiempo real)
        Usuario usuario = usuarioRepository.findByResetTokenAndTokenExpiresAfter(token, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("El enlace de recuperación es inválido o ha expirado."));

        // Actualizamos la clave (Texto plano temporalmente por decisión de equipo)
        usuario.setPassUsr(nuevaPassword);

        // UN SOLO USO: Limpiamos los campos inmediatamente para invalidar el link
        usuario.setResetToken(null);
        usuario.setTokenExpires(null);

        usuarioRepository.save(usuario);
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        if (usuario.getEstadoUsr() == 0) {
            throw new RuntimeException("El usuario se encuentra inactivo.");
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getCorreoUsr())
                .password(usuario.getPassUsr())
                .roles("USER")
                .build();
    }
}