package com.nodevet.app.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI nodeVetOpenAPI() {
        // Le damos un nombre interno a nuestro esquema de seguridad
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("NodeVet API")
                        .description("Documentación de los endpoints REST para el software de gestión veterinaria NodeVet.")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("Ricardo Cruz") // Aquí puedes poner los nombres de tu equipo
                                .email("soporte.nodevet@gmail.com")))
                
                // 1. Le decimos a Swagger que todos los endpoints usan este esquema
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                
                // 2. Configuramos cómo funciona el esquema (es un token Bearer en formato JWT)
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}