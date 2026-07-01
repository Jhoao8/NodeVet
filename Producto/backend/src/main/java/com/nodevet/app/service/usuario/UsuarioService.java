package com.nodevet.app.service.usuario;

import com.nodevet.app.dto.usuario.UsuarioRegistroDTO;
import com.nodevet.app.dto.usuario.UsuarioUpdateDTO;
import com.nodevet.app.model.CodigoVerificacion;
import com.nodevet.app.model.usuario.Tutor;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.repository.*;
import com.nodevet.app.repository.agenda.BloqueHorarioRepository;
import com.nodevet.app.service.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    private final AdminRepository adminRepository; 
    private final VeterinarioRepository veterinarioRepository; 
    private final CodigoVerificacionRepository codigoRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final BloqueHorarioRepository bloqueHorarioRepository;

    @Transactional
    public Usuario registrarUsuario(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado en el sistema.");
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

        Tutor nuevoTutor = Tutor.builder()
                .usuario(usuarioGuardado)
                .build();
        
        tutorRepository.save(nuevoTutor);

        return usuarioGuardado;
    }

    // --- MÉTODOS CRUD PARA GESTIÓN DE USUARIOS (POR ADMIN Y PERFIL) ---

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios(boolean incluirInactivos) {
        if (incluirInactivos) {
            return usuarioRepository.findAll();
        }
        return usuarioRepository.findAllByEstadoUsr(1);
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuariosActivos() {
        return usuarioRepository.findAllByEstadoUsr(1);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreoUsr(correo);
    }

    @Transactional
    public Usuario actualizarUsuario(Integer id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con ID: " + id));
        return aplicarActualizacion(usuario, dto);
    }

    @Transactional
    public void actualizarUsuarioPorCorreo(String correo, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        aplicarActualizacion(usuario, dto);
    }

    // Método centralizado para evitar duplicación de código
    private Usuario aplicarActualizacion(Usuario usuario, UsuarioUpdateDTO dto) {
        usuario.setNombreUsr(dto.getNombreUsr());
        usuario.setApellidoUsr(dto.getApellidoUsr());
        usuario.setTelefonoUsr(dto.getTelefonoUsr());
        
        // Si viene un correo nuevo y es diferente al actual, verificamos que no exista
        if (dto.getCorreoUsr() != null && !dto.getCorreoUsr().equals(usuario.getCorreoUsr())) {
            if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo especificado ya está en uso por otra cuenta.");
            }
            usuario.setCorreoUsr(dto.getCorreoUsr());
        }
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void actualizarFotoPerfil(String correoUsuario, String nuevaFotoUrl) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con correo: " + correoUsuario));

        usuario.setFotoUsr(nuevaFotoUrl);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarPasswordAutenticado(String correoUsuario, String passwordActual, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con correo: " + correoUsuario));

        if (passwordActual == null || passwordActual.isBlank() || nuevaPassword == null || nuevaPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes ingresar la contraseña actual y la nueva contraseña.");
        }

        if (!passwordEncoder.matches(passwordActual, usuario.getPassUsr())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no coincide.");
        }

        if (nuevaPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña debe tener al menos 6 caracteres.");
        }

        usuario.setPassUsr(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void desactivarUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con ID: " + id));

        // Si el usuario es veterinario, eliminar sus bloques horarios antes de desactivar
        veterinarioRepository.findByUsuario(usuario).ifPresent(vet -> {
            bloqueHorarioRepository.deleteByVeterinarioId(vet.getId());
        });

        usuarioRepository.softDelete(id);
    }

    @Transactional
    public void activarUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con ID: " + id));
        
        usuario.setEstadoUsr(1);
        usuarioRepository.save(usuario);
    }

    // --- METODOS PARA RECUPERAR CONTRASEÑA CON CÓDIGO (OTP) ---

    @Transactional
    public void generarTokenRecuperacion(String correo) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoUsr(correo);
        
        // Prevención de enumeración de usuarios: Si no existe, salimos silenciosamente
        if (usuarioOpt.isEmpty()) {
            System.out.println("DEBUG - Intento de recuperación ignorado: Correo no registrado (" + correo + ")");
            return; 
        }

        Usuario usuario = usuarioOpt.get();
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        CodigoVerificacion token = codigoRepo.findByUsuario(usuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay una solicitud de recuperación activa para este correo."));

        if (!token.getCodigo().equals(codigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código ingresado es incorrecto.");
        }

        if (token.getFecExpiracion().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código ha expirado. Por favor, solicita uno nuevo.");
        }
    }

    @Transactional
    public void restablecerPassword(String correo, String codigo, String nuevaPassword) {
        validarCodigoOTP(correo, codigo); // Reutilizamos la validación

        Usuario usuario = usuarioRepository.findByCorreoUsr(correo).get();
        CodigoVerificacion token = codigoRepo.findByUsuario(usuario).get();

        usuario.setPassUsr(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        codigoRepo.delete(token);
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        if (usuario.getEstadoUsr() == 0) {
            // Spring Security prefiere UsernameNotFoundException para bloquear el login limpiamente
            throw new UsernameNotFoundException("El usuario se encuentra inactivo.");
        }

        // Lógica estructural mejorada para determinar el rol del usuario
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // 1. ¿Es Admin? (Usamos la consulta nativa SQL para evitar problemas de mapeo)
        if (adminRepository.checkIsAdmin(usuario.getIdUsuario()) > 0) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } 
        // 2. Si no es Admin, ¿es Veterinario?
        else if (veterinarioRepository.findByUsuario(usuario).isPresent()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_VET"));
        } 
        // 3. Si no es ninguno de los anteriores, es Tutor (rol por defecto)
        else {
            authorities.add(new SimpleGrantedAuthority("ROLE_TUTOR"));
        }

        return new org.springframework.security.core.userdetails.User(
                usuario.getCorreoUsr(),
                usuario.getPassUsr(),
                authorities 
        );
    }
}