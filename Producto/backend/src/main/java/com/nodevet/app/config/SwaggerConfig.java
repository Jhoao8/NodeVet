package com.nodevet.app.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI nodeVetOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NodeVet API")
                        .description("Documentación de los endpoints REST para el software de gestión veterinaria NodeVet.")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("Tu Nombre/Equipo")
                                .email("contacto@nodevet.com")));
    }
}