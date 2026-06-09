package com.nodevet.app.config;

import com.nodevet.app.dto.AdminRegistroDTO;
import com.nodevet.app.repository.UsuarioRepository;
import com.nodevet.app.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final AdminService adminService;

    // Leemos las credenciales desde application.properties
    @Value("${nodevet.admin.email:admin@nodevet.com}")
    private String adminEmail;

    @Value("${nodevet.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Verificamos si el usuario administrador ya existe en la base de datos
        if (!usuarioRepository.existsByCorreoUsr(adminEmail)) {
            logger.info("No se encontró el usuario administrador inicial. Creando uno nuevo...");

            AdminRegistroDTO adminDto = new AdminRegistroDTO();
            adminDto.setNombreUsr("Admin");
            adminDto.setApellidoUsr("NodeVet");
            adminDto.setCorreoUsr(adminEmail);
            adminDto.setPassUsr(adminPassword);
            adminDto.setTelefonoUsr("999999999");
            adminDto.setNivelAcceso("SUPER_ADMIN");

            try {
                adminService.crearAdmin(adminDto);
                logger.info("Usuario administrador creado exitosamente con el correo: {}", adminEmail);
            } catch (Exception e) {
                logger.error("Error al crear el usuario administrador inicial", e);
            }
        } else {
            logger.info("El usuario administrador inicial ya existe. No se realizarán acciones.");
        }
    }
}
