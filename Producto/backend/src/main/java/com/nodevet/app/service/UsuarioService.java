package com.nodevet.app.service;

import com.nodevet.app.dto.UsuarioRegistroDTO;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    // Gracias a @RequiredArgsConstructor de Lombok, Spring inyectara automaticamente
    // el Repositorio aqui sin necesidad de escribir el @Autowired o el constructor a mano
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario registrarUsuario(UsuarioRegistroDTO dto) {
        // 1. Validar regla de negocio: ¿El correo ya existe?
        if (usuarioRepository.existsByCorreoUsr(dto.getCorreoUsr())) {
            throw new RuntimeException("El correo ya está registrado en el sistema.");
        }

        // 2. Mapear del DTO a la Entidad base de datos usando el patron Builder
        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr(dto.getNombreUsr())
                .apellidoUsr(dto.getApellidoUsr())
                .correoUsr(dto.getCorreoUsr())
                // IMPORTANTE: En el futuro proximo, integraremos BCrypt para encriptar la contraseña aqui
                .passUsr(dto.getPassUsr()) 
                .telefonoUsr(dto.getTelefonoUsr())
                .estadoUsr(1) // 1 = Activo por defecto
                .build();

        // 3. Guardar en base de datos
        return usuarioRepository.save(nuevoUsuario);
    }

    public Usuario autenticarUsuario(String correo, String password) {
        // 1. Buscamos al usuario por correo
        Usuario usuario = usuarioRepository.findByCorreoUsr(correo)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));
        
        // 2. Validamos la contraseña (esto cambiara cuando implementemos Spring Security y BCrypt)
        if (!usuario.getPassUsr().equals(password)) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        // 3. Validamos que el usuario este activo
        if (usuario.getEstadoUsr() == 0) {
            throw new RuntimeException("El usuario se encuentra inactivo.");
        }
        
        return usuario;
    }
}