package com.nodevet.app.service;

import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.model.CodigoVerificacion;
import com.nodevet.app.model.Tutor;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.CodigoVerificacionRepository;
import com.nodevet.app.repository.TutorRepository;
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
    private final TutorRepository tutorRepository; // <-- Añadido
    private final CodigoVerificacionRepository codigoRepo; // <-- Añadido
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario registrarUsuario(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

        // 1. Guardar Usuario
        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr(dto.getNombreUsr())
                .apellidoUsr(dto.getApellidoUsr())
                .correoUsr(dto.getCorreoUsr())
                .passUsr(passwordEncoder.encode(dto.getPassUsr()))
                .telefonoUsr(dto.getTelefonoUsr())
                .estadoUsr(1)
                .build();

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 2. Guardar Tutor asociado automáticamente
        Tutor nuevoTutor = Tutor.builder()
                .usuario(usuarioGuardado)
                .build();
        
        tutorRepository.save(nuevoTutor);

        return usuarioGuardado;
    }

    // --- METODOS PARA RECUPERAR CONTRASEÑA CON CÓDIGO (OTP) ---

    @Transactional
    public void generarTokenRecuperacion(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("No se encontró un usuario con ese correo."));

        String codigoOTP = String.format("%06d", new Random().nextInt(999999));
        
        // Buscamos si ya tiene un código previo. Si lo tiene lo actualizamos, si no, creamos uno nuevo.
        CodigoVerificacion token = codigoRepo.findByUsuario(usuario)
                .orElse(CodigoVerificacion.builder().usuario(usuario).build());
        
        token.setCodigo(codigoOTP);
        token.setFecExpiracion(LocalDateTime.now().plusMinutes(15));
        
        codigoRepo.save(token);
        
        // ENVIO REAL DE CORREO
        emailService.enviarCorreoRecuperacion(correo, codigoOTP);
        
        System.out.println("DEBUG - Código " + codigoOTP + " enviado a: " + correo);
    }

    @Transactional(readOnly = true)
    public void validarCodigoOTP(String correo, String codigo) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        CodigoVerificacion token = codigoRepo.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("No hay una solicitud de recuperación activa para este correo."));

        if (!token.getCodigo().equals(codigo)) {
            throw new RuntimeException("El código ingresado es incorrecto.");
        }

        if (token.getFecExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado. Por favor, solicita uno nuevo.");
        }
    }

    @Transactional
    public void restablecerPassword(String correo, String codigo, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        CodigoVerificacion token = codigoRepo.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("No hay una solicitud de recuperación activa."));

        // Doble validación por seguridad
        if (!token.getCodigo().equals(codigo)) {
            throw new RuntimeException("El código es incorrecto.");
        }
        if (token.getFecExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado.");
        }

        // Actualizamos la clave
        usuario.setPassUsr(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        // UN SOLO USO: Eliminamos el registro de la tabla para invalidar el código
        codigoRepo.delete(token);
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