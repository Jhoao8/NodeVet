package com.nodevet.app.service;

import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.dto.UsuarioUpdateDTO;
import com.nodevet.app.model.CodigoVerificacion;
import com.nodevet.app.model.Tutor;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final TutorRepository tutorRepository;
    private final AdminRepository adminRepository; // Inyectamos el nuevo repo
    private final VeterinarioRepository veterinarioRepository; // Inyectamos el nuevo repo
    private final CodigoVerificacionRepository codigoRepo;
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
                .fotoUsr(dto.getFotoUsr())
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

    // --- MÉTODOS CRUD PARA GESTIÓN DE USUARIOS (POR ADMIN) ---

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuariosActivos() {
        return usuarioRepository.findAllByEstadoUsr(1);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    @Transactional
    public Usuario actualizarUsuario(Integer id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        usuario.setNombreUsr(dto.getNombreUsr());
        usuario.setApellidoUsr(dto.getApellidoUsr());
        usuario.setTelefonoUsr(dto.getTelefonoUsr());

        if (dto.getFotoUsr() != null) {
            usuario.setFotoUsr(dto.getFotoUsr());
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void desactivarUsuario(Integer id) {
        usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        usuarioRepository.softDelete(id);
    }

    // --- METODOS PARA RECUPERAR CONTRASEÑA CON CÓDIGO (OTP) ---

    @Transactional
    public void generarTokenRecuperacion(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("No se encontró un usuario con ese correo."));

        String codigoOTP = String.format("%06d", new Random().nextInt(999999));
        
        CodigoVerificacion token = codigoRepo.findByUsuario(usuario)
                .orElse(CodigoVerificacion.builder().usuario(usuario).build());
        
        token.setCodigo(codigoOTP);
        token.setFecExpiracion(LocalDateTime.now().plusMinutes(15));
        
        codigoRepo.save(token);
        
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

        if (!token.getCodigo().equals(codigo)) {
            throw new RuntimeException("El código es incorrecto.");
        }
        if (token.getFecExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado.");
        }

        usuario.setPassUsr(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        codigoRepo.delete(token);
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        if (usuario.getEstadoUsr() == 0) {
            throw new RuntimeException("El usuario se encuentra inactivo.");
        }

        // Lógica para determinar el rol del usuario
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // 1. ¿Es Admin? (El más importante)
        adminRepository.findByUsuario(usuario).ifPresent(admin -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        });

        // 2. Si no es Admin, ¿es Veterinario?
        if (authorities.isEmpty()) {
            veterinarioRepository.findByUsuario(usuario).ifPresent(vet -> {
                authorities.add(new SimpleGrantedAuthority("ROLE_VET"));
            });
        }

        // 3. Si no es ninguno de los anteriores, es Tutor (rol por defecto para usuarios registrados)
        if (authorities.isEmpty()) {
            tutorRepository.findByUsuario(usuario).ifPresent(tutor -> {
                authorities.add(new SimpleGrantedAuthority("ROLE_TUTOR"));
            });
        }

        return new org.springframework.security.core.userdetails.User(
                usuario.getCorreoUsr(),
                usuario.getPassUsr(),
                authorities // Usamos la lista de roles dinámicos
        );
    }
}
