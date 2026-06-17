package com.nodevet.app.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.nodevet.app.model.usuario.Usuario;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    @DisplayName("Debe guardar y buscar un usuario por su correo electrónico")
    void debeGuardarYBuscarUsuarioPorCorreo() {
        // --- ARRANGE (Preparación) ---
        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsr("Juan")
                .apellidoUsr("Perez")
                .correoUsr("juan.perez@test.com")
                .passUsr("password123")
                .telefonoUsr("+56912345678")
                .estadoUsr(1)
                .build();

        // --- ACT (Ejecución) ---
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
        Optional<Usuario> usuarioRecuperado = usuarioRepository.findByCorreoUsr("juan.perez@test.com");
        boolean existe = usuarioRepository.existsByCorreoUsr("juan.perez@test.com");

        // --- ASSERT (Verificación) ---
        assertThat(usuarioGuardado).isNotNull();
        assertThat(usuarioGuardado.getIdUsuario()).isNotNull();
        
        assertThat(usuarioRecuperado).isPresent();
        assertThat(usuarioRecuperado.get().getNombreUsr()).isEqualTo("Juan");
        
        assertThat(existe).isTrue();
    }
}
