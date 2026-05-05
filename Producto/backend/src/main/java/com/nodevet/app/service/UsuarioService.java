package com.nodevet.app.service;

import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario registrarUsuario(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr(dto.getNombreUsr())
                .apellidoUsr(dto.getApellidoUsr())
                .correoUsr(dto.getCorreoUsr())
                .passUsr(passwordEncoder.encode(dto.getPassUsr()))
                .telefonoUsr(dto.getTelefonoUsr())
                .estadoUsr(1)
                .build();

        return usuarioRepository.save(nuevoUsuario);
    }

    // --- METODOS PARA RECUPERAR CONTRASEÑA CON CÓDIGO (OTP) ---

    @Transactional
    public void generarTokenRecuperacion(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("No se encontró un usuario con ese correo."));

        // Generamos un codigo numerico aleatorio de 6 dígitos
        String codigoOTP = String.format("%06d", new Random().nextInt(999999));
        usuario.setResetToken(codigoOTP);
        
        // Expiracion reducida a 15 minutos (Mejor práctica para códigos numéricos)
        usuario.setTokenExpires(LocalDateTime.now().plusMinutes(15));

        usuarioRepository.save(usuario);
        
        // ENVIO REAL DE CORREO
        emailService.enviarCorreoRecuperacion(correo, codigoOTP);
        
        System.out.println("DEBUG - Código " + codigoOTP + " enviado a: " + correo);
    }

    // Nuevo método solo para validar si el código es correcto antes de ir a la pantalla 2
    @Transactional(readOnly = true)
    public void validarCodigoOTP(String correo, String codigo) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (usuario.getResetToken() == null || !usuario.getResetToken().equals(codigo)) {
            throw new RuntimeException("El código ingresado es incorrecto.");
        }

        if (usuario.getTokenExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado. Por favor, solicita uno nuevo.");
        }
    }

    @Transactional
    public void restablecerPassword(String correo, String codigo, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        // Doble validación por seguridad
        if (usuario.getResetToken() == null || !usuario.getResetToken().equals(codigo)) {
            throw new RuntimeException("El código es incorrecto.");
        }
        if (usuario.getTokenExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado.");
        }

        // Actualizamos la clave
        usuario.setPassUsr(passwordEncoder.encode(nuevaPassword));

        // UN SOLO USO: Limpiamos los campos inmediatamente para invalidar el código
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